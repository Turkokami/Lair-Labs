import { HostCore, GameError, type GameState, type Intent, type PlayerView } from '../engine/game';
import type { Conn, HostTransport, ClientTransport, ToClient, ToHost } from './transport';

/** Runs on the GM's device: owns the game and serves each phone its own filtered view. */
export class HostSession {
  core: HostCore;
  private conns = new Map<Conn, string | null>(); // conn -> player id once they say hello
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastSent = new Map<Conn, string>();
  onLocalChange: () => void = () => {};

  constructor(state: GameState, private transport: HostTransport, private debounceMs = 40) {
    this.core = new HostCore(state);
    this.core.onChange = () => {
      this.onLocalChange();
      this.schedule();
    };
    this.core.onNotice = (pid, text) => {
      for (const [c, id] of this.conns) if (id === pid) c.send({ t: 'notice', text } satisfies ToClient);
    };
  }

  async start() {
    await this.transport.listen(this.core.s.code, (c) => this.accept(c));
  }
  stop() {
    this.transport.close();
    for (const c of this.conns.keys()) c.close();
    this.conns.clear();
  }

  /** GM actions go through the same rules engine. Returns an error message or undefined. */
  gm(intent: Intent): string | undefined {
    try {
      this.core.handle('gm', intent);
    } catch (e) {
      return e instanceof Error ? e.message : String(e);
    }
  }

  connectedCount() {
    return [...this.conns.values()].filter(Boolean).length;
  }

  private accept(c: Conn) {
    this.conns.set(c, null);
    c.onData((raw) => this.onMessage(c, raw as ToHost));
    c.onClose(() => {
      const id = this.conns.get(c);
      this.conns.delete(c);
      this.lastSent.delete(c);
      if (id && ![...this.conns.values()].includes(id)) this.core.setConnected(id, false);
    });
  }

  private onMessage(c: Conn, m: ToHost) {
    if (!m || typeof m !== 'object') return;
    if (m.t === 'ping') return;
    if (m.t !== 'intent' || !m.intent) return;
    const it = m.intent;
    let id = this.conns.get(c) ?? null;
    try {
      if (it.t === 'hello') {
        if (typeof it.clientId !== 'string' || !/^[\w-]{6,64}$/.test(it.clientId) || it.clientId === 'gm') throw new GameError('Bad client.');
        // one live connection per player: drop any older one
        for (const [other, oid] of this.conns) if (other !== c && oid === it.clientId) {
          this.conns.delete(other);
          other.send({ t: 'kicked', reason: 'You opened this table somewhere else, so this screen was disconnected.' } satisfies ToClient);
          setTimeout(() => other.close(), 200);
        }
        this.conns.set(c, it.clientId);
        id = it.clientId;
        this.core.handle(id, it);
      } else {
        if (!id) throw new GameError('Say hello first.');
        if (it.t.startsWith('gm:')) throw new GameError('Only the GM can do that.');
        this.core.handle(id, it);
      }
      if (m.rid !== undefined) c.send({ t: 'ack', rid: m.rid, ok: true } satisfies ToClient);
      this.flushOne(c);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (it.t === 'hello') {
        c.send({ t: 'kicked', reason: msg } satisfies ToClient);
        setTimeout(() => c.close(), 200);
      }
      if (m.rid !== undefined) c.send({ t: 'ack', rid: m.rid, ok: false, error: msg } satisfies ToClient);
    }
    this.schedule();
  }

  kick(playerId: string) {
    for (const [c, id] of this.conns) if (id === playerId) {
      c.send({ t: 'kicked', reason: 'The GM removed you from the table.' } satisfies ToClient);
      setTimeout(() => c.close(), 200);
    }
    this.gm({ t: 'gm:kick', playerId });
  }

  private schedule() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flushAll();
    }, this.debounceMs);
  }
  flushAll() {
    for (const c of this.conns.keys()) this.flushOne(c);
  }
  private flushOne(c: Conn) {
    const id = this.conns.get(c);
    if (!id || !this.core.s.players[id]) return;
    const view = this.core.view(id);
    const json = JSON.stringify(view);
    if (this.lastSent.get(c) === json) return;
    this.lastSent.set(c, json);
    c.send({ t: 'view', view } satisfies ToClient);
  }
}

export type ClientStatus = 'connecting' | 'connected' | 'reconnecting' | 'closed' | 'kicked';

/** Runs on a phone. Keeps trying to reconnect if the link drops. */
export class ClientSession {
  view?: PlayerView;
  status: ClientStatus = 'connecting';
  error = '';
  private conn?: Conn;
  private rid = 0;
  private pending = new Map<number, { resolve: () => void; reject: (e: Error) => void }>();
  private retry = 0;
  private stopped = false;
  private ping?: ReturnType<typeof setInterval>;
  onUpdate: () => void = () => {};
  onNotice: (text: string) => void = () => {};

  constructor(public code: string, public name: string, public clientId: string, private transport: ClientTransport) {}

  async start() {
    this.stopped = false;
    await this.open();
  }

  private async open() {
    try {
      const c = await this.transport.connect(this.code);
      this.conn = c;
      c.onData((m) => this.onMessage(m as ToClient));
      c.onClose(() => {
        if (this.conn !== c) return;
        this.conn = undefined;
        for (const p of this.pending.values()) p.reject(new Error('Connection lost.'));
        this.pending.clear();
        if (!this.stopped && this.status !== 'kicked') {
          this.status = 'reconnecting';
          this.onUpdate();
          this.scheduleRetry();
        }
      });
      this.retry = 0;
      this.status = 'connected';
      this.error = '';
      await this.send({ t: 'hello', name: this.name, clientId: this.clientId });
      clearInterval(this.ping);
      this.ping = setInterval(() => this.conn?.send({ t: 'ping' } satisfies ToHost), 20000);
      this.onUpdate();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
      if (this.status === 'kicked') {
        this.onUpdate();
        throw e;
      }
      if ((this.status === 'connecting' || this.status === 'connected') && !this.view) {
        this.status = 'closed';
        this.onUpdate();
        throw e;
      }
      this.status = 'reconnecting';
      this.onUpdate();
      this.scheduleRetry();
    }
  }

  private scheduleRetry() {
    if (this.stopped) return;
    const wait = Math.min(10000, 1000 * 2 ** this.retry++);
    setTimeout(() => !this.stopped && !this.conn && this.open().catch(() => {}), wait);
  }

  stop() {
    this.stopped = true;
    clearInterval(this.ping);
    this.conn?.close();
    this.status = 'closed';
  }

  send(intent: Intent): Promise<void> {
    const c = this.conn;
    if (!c) return Promise.reject(new Error('Not connected yet. Hang on…'));
    const rid = ++this.rid;
    return new Promise((resolve, reject) => {
      this.pending.set(rid, { resolve, reject });
      c.send({ t: 'intent', rid, intent } satisfies ToHost);
      setTimeout(() => {
        if (this.pending.delete(rid)) reject(new Error('The GM did not answer. Check your connection.'));
      }, 10000);
    });
  }

  private onMessage(m: ToClient) {
    if (!m || typeof m !== 'object') return;
    switch (m.t) {
      case 'view':
        this.view = m.view;
        this.onUpdate();
        break;
      case 'ack': {
        const p = this.pending.get(m.rid);
        if (!p) return;
        this.pending.delete(m.rid);
        m.ok ? p.resolve() : p.reject(new Error(m.error || 'Refused.'));
        break;
      }
      case 'notice':
        this.onNotice(m.text);
        break;
      case 'kicked':
        this.status = 'kicked';
        this.error = m.reason;
        this.stopped = true;
        this.onUpdate();
        break;
    }
  }
}
