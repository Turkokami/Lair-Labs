import type { WireView } from './pack';
// Network layer. The GM's device is the host; phones connect to it directly (peer to peer) using PeerJS.
// A tiny in-memory transport lets tests run a host and several phones in one process.
import type { Intent, PlayerView } from '../engine/game';

export type ToHost = { t: 'intent'; rid?: number; intent: Intent } | { t: 'ping' };
export type ToClient =
  | { t: 'view'; view: PlayerView | WireView }
  | { t: 'ack'; rid: number; ok: boolean; error?: string }
  | { t: 'notice'; text: string }
  | { t: 'kicked'; reason: string }
  /** A map's background picture (Universal VTT imports). Sent once per connection, apart from the view. */
  | { t: 'backdrop'; id: string; data: string };

export interface Conn {
  send(msg: unknown): void;
  close(): void;
  onData(cb: (msg: unknown) => void): void;
  onClose(cb: () => void): void;
}

export interface HostTransport {
  /** Starts listening for this room code. Resolves once phones can connect. */
  listen(code: string, onConn: (c: Conn) => void): Promise<void>;
  close(): void;
}
export interface ClientTransport {
  connect(code: string): Promise<Conn>;
}

// ---------- in-memory (tests) ----------
export class MemoryHub {
  hosts = new Map<string, (c: Conn) => void>();
  makeHost(): HostTransport {
    let code = '';
    return {
      listen: async (c, onConn) => {
        code = c;
        this.hosts.set(c, onConn);
      },
      close: () => void this.hosts.delete(code),
    };
  }
  makeClient(): ClientTransport {
    return {
      connect: async (code) => {
        const onConn = this.hosts.get(code);
        if (!onConn) throw new Error('No table with that code.');
        const [a, b] = memoryPair();
        onConn(b);
        return a;
      },
    };
  }
}

function memoryPair(): [Conn, Conn] {
  const mk = () => ({ data: [] as ((m: unknown) => void)[], close: [] as (() => void)[], open: true });
  const A = mk(), B = mk();
  const conn = (me: typeof A, other: typeof A): Conn => ({
    send: (msg) => {
      if (!me.open) return;
      const copy = JSON.parse(JSON.stringify(msg));
      queueMicrotask(() => other.data.forEach((f) => f(copy)));
    },
    close: () => {
      if (!me.open) return;
      me.open = other.open = false;
      queueMicrotask(() => {
        me.close.forEach((f) => f());
        other.close.forEach((f) => f());
      });
    },
    onData: (cb) => void me.data.push(cb),
    onClose: (cb) => void me.close.push(cb),
  });
  return [conn(A, B), conn(B, A)];
}

// ---------- PeerJS (real) ----------
export const PEER_PREFIX = 'lairlabs-';

export interface PeerOptions { host?: string; port?: number; path?: string; secure?: boolean; debug?: number; config?: RTCConfiguration; }

/** Lets a tester point at a private PeerServer: ?peerhost=localhost&peerport=9000&peerpath=/myapp&peersecure=0 */
export function peerOptionsFromUrl(search = typeof location !== 'undefined' ? location.search : ''): PeerOptions {
  const q = new URLSearchParams(search);
  const o: PeerOptions = {
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] },
  };
  if (q.get('peerhost')) {
    o.host = q.get('peerhost')!;
    o.port = Number(q.get('peerport') || 443);
    o.path = q.get('peerpath') || '/';
    o.secure = q.get('peersecure') !== '0';
  }
  return o;
}

async function loadPeer() {
  const mod = await import('peerjs');
  return mod.Peer ?? (mod as unknown as { default: typeof mod.Peer }).default;
}

function wrapPeerConn(dc: import('peerjs').DataConnection): Conn {
  return {
    send: (m) => {
      try {
        dc.send(m);
      } catch {
        /* closed */
      }
    },
    close: () => dc.close(),
    onData: (cb) => void dc.on('data', cb),
    onClose: (cb) => {
      dc.on('close', cb);
      dc.on('error', cb);
    },
  };
}

export function peerHost(opts = peerOptionsFromUrl()): HostTransport {
  let peer: import('peerjs').Peer | undefined;
  return {
    async listen(code, onConn) {
      const Peer = await loadPeer();
      await new Promise<void>((resolve, reject) => {
        peer = new Peer(PEER_PREFIX + code, opts);
        const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking server. Check your connection and try again.')), 15000);
        peer.on('open', () => {
          clearTimeout(timer);
          resolve();
        });
        peer.on('error', (e: Error & { type?: string }) => {
          clearTimeout(timer);
          if (e.type === 'unavailable-id') reject(new Error('code-taken'));
          else if (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error') reject(new Error('Could not reach the matchmaking server.'));
        });
        peer.on('connection', (dc) => {
          dc.on('open', () => onConn(wrapPeerConn(dc)));
        });
        // keep the signaling link alive so new phones can still find us
        peer.on('disconnected', () => {
          setTimeout(() => peer && !peer.destroyed && peer.reconnect(), 1500);
        });
      });
    },
    close() {
      peer?.destroy();
    },
  };
}

export function peerClient(opts = peerOptionsFromUrl()): ClientTransport {
  let peer: import('peerjs').Peer | undefined;
  return {
    async connect(code) {
      const Peer = await loadPeer();
      if (!peer || peer.destroyed) {
        peer = await new Promise<import('peerjs').Peer>((resolve, reject) => {
          const p = new Peer(opts);
          const timer = setTimeout(() => reject(new Error('Could not reach the matchmaking server.')), 15000);
          p.on('open', () => {
            clearTimeout(timer);
            resolve(p);
          });
          p.on('error', (e) => {
            clearTimeout(timer);
            reject(e);
          });
        });
      }
      const p = peer;
      return new Promise<Conn>((resolve, reject) => {
        // binary, not json: PeerJS drops any json message over about 16 KB, and a big map's view is bigger than that.
        // The binary channel splits big messages into pieces and puts them back together.
        const dc = p.connect(PEER_PREFIX + code, { reliable: true, serialization: 'binary' });
        const timer = setTimeout(() => reject(new Error("Couldn't find that table. Check the code, and make sure the GM's screen is open.")), 12000);
        const onErr = (e: Error & { type?: string }) => {
          clearTimeout(timer);
          reject(e.type === 'peer-unavailable' ? new Error("No table with that code. Check it with your GM.") : e);
        };
        p.once('error', onErr);
        dc.on('open', () => {
          clearTimeout(timer);
          p.off('error', onErr);
          resolve(wrapPeerConn(dc));
        });
      });
    },
  };
}
