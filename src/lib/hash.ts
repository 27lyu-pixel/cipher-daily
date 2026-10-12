const encoder = new TextEncoder();

/** 32-bit FNV-1a over the UTF-8 bytes of `s`. Returns an unsigned 32-bit integer. */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (const byte of encoder.encode(s)) {
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
