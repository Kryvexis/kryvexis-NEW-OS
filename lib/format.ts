export function fmtZar(v: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(v)
}

export function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function genDocNumber(prefix: 'Q' | 'INV') {
  // Example: Q-20260222-4821
  const ymd = isoDate().replaceAll('-', '')
  const rnd = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${ymd}-${rnd}`
}
