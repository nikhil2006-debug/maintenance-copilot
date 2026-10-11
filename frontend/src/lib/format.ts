export const fmtCount = (n: number | null) => (n === null ? 'Unavailable' : n.toLocaleString())

export const fmtScore = (n: number | null) => (n === null ? 'Unavailable' : n.toFixed(2))

export const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
}