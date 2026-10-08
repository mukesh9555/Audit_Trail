export type EventType =
  | 'CONTAINER_CREATED'
  | 'LOADED_ON_SHIP'
  | 'DEPARTED_PORT'
  | 'TEMPERATURE_SPIKE'
  | 'ARRIVED_AT_PORT'
  | 'INSPECTION_STARTED'
  | 'INSPECTION_COMPLETED'
  | 'DELIVERED'

export type ShipmentStatus =
  | 'Created'
  | 'Loaded'
  | 'In Transit'
  | 'Temperature Alert'
  | 'At Port'
  | 'Under Inspection'
  | 'Cleared'
  | 'Delivered'

export type RiskLevel = 'Low' | 'Medium' | 'High'
export type EventStatus = 'OK' | 'WARNING' | 'CRITICAL'
export type LogStatus = 'SUCCESS' | 'WARNING' | 'FAILED'
export type PayloadValue = string | number | boolean
export type Payload = Record<string, PayloadValue>

export interface ShipmentEvent {
  id: string
  shipmentId: string
  version: number
  type: EventType
  timestamp: string
  actor: string
  location: string
  status: EventStatus
  payload: Payload
  hash: string
  prevHash: string
}

export interface Shipment {
  id: string
  containerId: string
  origin: string
  destination: string
  cargo: string
  vessel: string
  status: ShipmentStatus
  lastEvent: EventType
  lastUpdated: string
  risk: RiskLevel
  version: number
  expectedRange: { min: number; max: number }
}

export interface ReconstructedState {
  shipmentId: string
  containerId: string
  location: string
  status: ShipmentStatus
  temperatureC: number | null
  risk: RiskLevel
  version: number
  eventCount: number
  totalEvents: number
  asOf: string
  lastEventType: EventType
}

export interface SensorReading {
  id: string
  shipmentId: string
  timestamp: string
  temperatureC: number
  humidityPct: number
  inRange: boolean
}

export interface AuditLog {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  eventType: EventType | null
  status: LogStatus
  source: string
  version: number | null
  previousState: string | null
  resultingState: string | null
  payload: Payload | null
  metadata: Record<string, string | number>
}

export interface ReportMeta {
  id: string
  name: string
  description: string
  type: string
  generatedAt: string
  records: number
  sizeBytes: number
}

export interface ReportData {
  meta: ReportMeta
  columns: string[]
  rows: Array<Record<string, string | number>>
}

export interface DashboardData {
  stats: { totalShipments: number; activeShipments: number; eventsToday: number; exceptions: number }
  activity: Array<{ label: string; events: number; shipments: number }>
  eventsByType: Array<{ name: string; value: number }>
  statusDistribution: Array<{ name: string; value: number }>
  recentEvents: ShipmentEvent[]
  exceptions: Array<{ shipmentId: string; containerId: string; message: string; since: string; severity: RiskLevel }>
  health: Array<{ name: string; detail: string; status: 'Operational' | 'Degraded'; metric: string }>
}

export type RangeDays = 7 | 30 | 90

export interface AnalyticsData {
  range: RangeDays
  volume: Array<{ label: string; events: number }>
  temperature: Array<{ label: string; avg: number; max: number }>
  statusDistribution: Array<{ name: string; value: number }>
  exceptions: Array<{ label: string; exceptions: number }>
  eventsByType: Array<{ name: string; value: number }>
}

export interface SearchResults {
  shipments: Shipment[]
  events: ShipmentEvent[]
  logs: AuditLog[]
}

export interface Settings {
  theme: 'light' | 'dark'
  notifications: { email: boolean; failedLogin: boolean; critical: boolean; digest: boolean }
  account: { name: string; email: string; role: string }
}
