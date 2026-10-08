import { DEMO_NOW } from './constants'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

export function relativeTime(iso: string): string {
  const diffMin = Math.max(0, Math.round((DEMO_NOW.getTime() - new Date(iso).getTime()) / 60000))
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`
  const h = Math.floor(diffMin / 60)
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`
  const d = Math.floor(h / 24)
  return `${d} day${d === 1 ? '' : 's'} ago`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function humanizeEvent(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
