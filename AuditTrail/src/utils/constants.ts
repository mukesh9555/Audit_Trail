import type { EventType, ShipmentStatus, RiskLevel, Settings } from '../types'

/** Fixed "now" for the demo so relative timestamps are stable and match the sample data. */
export const DEMO_NOW = new Date('2026-09-18T14:34:00Z')

export const EVENT_SEQUENCE: EventType[] = [
  'CONTAINER_CREATED',
  'LOADED_ON_SHIP',
  'DEPARTED_PORT',
  'TEMPERATURE_SPIKE',
  'ARRIVED_AT_PORT',
  'INSPECTION_STARTED',
  'INSPECTION_COMPLETED',
  'DELIVERED',
]

export const ALL_STATUSES: ShipmentStatus[] = [
  'Created',
  'Loaded',
  'In Transit',
  'Temperature Alert',
  'At Port',
  'Under Inspection',
  'Cleared',
  'Delivered',
]

export const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High']

export const PORT_COUNTRY: Record<string, string> = {
  Mumbai: 'India',
  Chennai: 'India',
  Dubai: 'UAE',
  Singapore: 'Singapore',
  Rotterdam: 'Netherlands',
  Hamburg: 'Germany',
  Felixstowe: 'United Kingdom',
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  notifications: { email: true, failedLogin: true, critical: true, digest: false },
  account: { name: 'Demo User', email: 'demo@audittrail.com', role: 'Administrator' },
}

export const STORAGE_KEYS = {
  settings: 'audittrail.settings',
  session: 'audittrail.session',
} as const

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', title: 'Dashboard' },
  { to: '/shipments', label: 'Shipments', title: 'Shipments' },
  { to: '/timeline', label: 'Timeline', title: 'Shipment State Reconstruction' },
  { to: '/audit-logs', label: 'Audit Logs', title: 'Audit Logs' },
  { to: '/reports', label: 'Reports', title: 'Reports' },
  { to: '/analytics', label: 'Analytics', title: 'Analytics' },
  { to: '/settings', label: 'Settings', title: 'Settings' },
] as const
