/** Small FNV-1a based hash used to illustrate a tamper-evident event chain (not cryptographic). */
export function fnv1a(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function chainHash(prev: string, body: string): string {
  return fnv1a(prev + body) + fnv1a(body + prev).slice(0, 4)
}
