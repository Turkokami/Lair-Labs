import { Suspense, lazy, useState } from 'react';

const Demo3D = lazy(() => import('./view3d/Demo3D'));
const Showroom3D = lazy(() => import('./view3d/Showroom3D'));
import { GMApp } from './ui/GM';
import { PlayerApp } from './ui/Player';
import { About } from './ui/About';
import { Toasts } from './ui/common';

type Route = 'home' | 'gm' | 'join' | 'about';

export function App() {
  const q = new URLSearchParams(location.search);
  const joinCode = q.get('join') ?? undefined;
  const [route, setRoute] = useState<Route>(joinCode ? 'join' : 'home');
  if (q.has('showroom3d'))
    return (
      <>
        <Suspense fallback={<div className="curtain">Setting out the showroom…</div>}>
          <Showroom3D />
        </Suspense>
        <Toasts />
      </>
    );
  if (q.has('demo3d'))
    return (
      <>
        <Suspense fallback={<div className="curtain">Building the dungeon in 3D…</div>}>
          <Demo3D />
        </Suspense>
        <Toasts />
      </>
    );
  const home = () => {
    history.replaceState(null, '', location.pathname + keepPeer());
    setRoute('home');
  };
  return (
    <>
      {route === 'home' && (
        <div className="screen center-screen home">
          <div className="panel home-panel">
            <h1 className="logo">Lair Labs</h1>
            <p className="tagline">Build a dungeon, share a code, and play with friends on their phones.</p>
            <button className="primary block big-btn" onClick={() => setRoute('join')}>Join a game</button>
            <button className="ghost block big-btn" onClick={() => setRoute('gm')}>I'm the GM</button>
            <p className="muted small">Free, no accounts. Your GM's screen hosts the game.</p>
            <button className="link" onClick={() => setRoute('about')}>About and credits</button>
          </div>
        </div>
      )}
      {route === 'gm' && <GMApp onExit={home} />}
      {route === 'join' && <PlayerApp initialCode={joinCode} onExit={home} />}
      {route === 'about' && <About onBack={home} />}
      <Toasts />
    </>
  );
}

function keepPeer() {
  const q = new URLSearchParams(location.search);
  const out = new URLSearchParams();
  for (const k of ['peerhost', 'peerport', 'peerpath', 'peersecure']) if (q.get(k)) out.set(k, q.get(k)!);
  const s = out.toString();
  return s ? `?${s}` : '';
}
