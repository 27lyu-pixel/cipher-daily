// Records the current size and hash of each quote bank in src/data/quotes.lock.json.
// Run after appending quotes: `npm run quotes:lock`. Existing entries must never change;
// quoteBank.test.ts fails if they do.
import { readFileSync, writeFileSync } from 'node:fs';

function fnv1a(s) {
  let h = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(s)) {
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const lock = {};
for (const lang of ['en', 'es']) {
  const bank = JSON.parse(readFileSync(new URL(`../src/data/quotes.${lang}.json`, import.meta.url), 'utf8'));
  lock[lang] = { count: bank.length, fnv1a: fnv1a(JSON.stringify(bank)) };
}
writeFileSync(new URL('../src/data/quotes.lock.json', import.meta.url), JSON.stringify(lock, null, 2) + '\n');
console.log(lock);
