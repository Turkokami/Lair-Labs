import { ATTRIBUTION } from '../rules/core';

export function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen scroll">
      <div className="pad stack about">
        <h1 className="logo">Lair Labs</h1>
        <p>A free digital tabletop for your own game nights. The GM builds a dungeon, players join from their phones with a room code, and everyone plays on the same map with real dice, character sheets, fog of war and initiative.</p>
        <h2>How it works</h2>
        <ul>
          <li>The GM's screen hosts the game. Phones connect straight to it, so there's no server to pay for and no accounts.</li>
          <li>Keep the GM's screen open while you play. Everything is saved on the GM's device, and heroes are saved on each player's phone.</li>
          <li>There's no voice chat. Use Discord, and paste your invite on the GM's Table tab so players get a Voice button.</li>
        </ul>
        <h2>Rules content and credits</h2>
        {ATTRIBUTION.map((a, i) => <p key={i} className="small">{a}</p>)}
        <p className="small muted">Lair Labs is an independent project. It isn't affiliated with or endorsed by Wizards of the Coast. Rules text in the app is summarized; your GM has the final say.</p>
        <button className="ghost" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
