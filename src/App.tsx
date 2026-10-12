import { CIPHERS } from './config/ciphers';
import { quoteById } from './data/quoteBank';
import { generateDailySet } from './game/daily';
import { nyDateString } from './lib/nyDate';

// Phase 1 placeholder: shows today's daily selection so seeding can be checked by eye.
export function App() {
  const set = generateDailySet(nyDateString());
  return (
    <main>
      <h1>Cipher Daily</h1>
      <p>
        Daily set for {set.date} (New York time), Division {set.division}
      </p>
      <ol>
        {set.slots.map((s) => (
          <li key={s.slot}>
            <strong>{CIPHERS[s.cipher].name}</strong>
            {s.slot === 'featured' && ' (featured)'}
            {s.quoteId && <span className="muted"> · {quoteById(s.quoteId)?.letters} letters</span>}
          </li>
        ))}
      </ol>
    </main>
  );
}
