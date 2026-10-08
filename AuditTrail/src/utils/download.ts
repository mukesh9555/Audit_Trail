function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function csvCell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(columns: string[], rows: Array<Record<string, string | number>>): string {
  const head = columns.map(csvCell).join(',')
  const body = rows.map((r) => columns.map((c) => csvCell(r[c] ?? '')).join(','))
  return [head, ...body].join('\n')
}

export function downloadCsv(filename: string, columns: string[], rows: Array<Record<string, string | number>>) {
  triggerDownload(new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' }), filename)
}

export function downloadJson(filename: string, data: unknown) {
  triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename)
}
