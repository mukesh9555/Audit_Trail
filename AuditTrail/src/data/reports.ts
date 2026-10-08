import type { ReportData, ReportMeta } from '../types'
import { ALL_EVENTS, SHIPMENTS } from './shipments'
import { AUDIT_LOGS } from './auditLogs'
import { SENSOR_READINGS } from './sensors'
import { buildAnalytics } from './metrics'
import { DEMO_NOW } from '../utils/constants'
import { toCsv } from '../utils/download'

type Row = Record<string, string | number>

interface Definition {
  id: string
  name: string
  type: string
  description: string
  hoursAgo: number
  columns: string[]
  rows: () => Row[]
}

const eventRow = (e: (typeof ALL_EVENTS)[number]): Row => ({
  event_id: e.id,
  shipment_id: e.shipmentId,
  version: e.version,
  event_type: e.type,
  timestamp: e.timestamp,
  actor: e.actor,
  location: e.location,
  status: e.status,
})

const DEFINITIONS: Definition[] = [
  {
    id: 'RPT-001', name: 'Shipment Audit Report', type: 'Compliance', hoursAgo: 3,
    description: 'Every event appended to every shipment stream, with version, actor and status.',
    columns: ['event_id', 'shipment_id', 'version', 'event_type', 'timestamp', 'actor', 'location', 'status'],
    rows: () => [...ALL_EVENTS].reverse().map(eventRow),
  },
  {
    id: 'RPT-002', name: 'Security Audit Report', type: 'Security', hoursAgo: 8,
    description: 'Sign-ins, permission checks and rejected commands recorded in the audit log.',
    columns: ['log_id', 'timestamp', 'actor', 'action', 'resource', 'status', 'source'],
    rows: () =>
      AUDIT_LOGS.filter((l) => l.eventType === null || l.status === 'FAILED').map((l) => ({
        log_id: l.id, timestamp: l.timestamp, actor: l.actor, action: l.action, resource: l.resource, status: l.status, source: l.source,
      })),
  },
  {
    id: 'RPT-003', name: 'Temperature Exception Report', type: 'Cold chain', hoursAgo: 1,
    description: 'Shipments where a sensor reading left the expected range for the cargo.',
    columns: ['shipment_id', 'container_id', 'cargo', 'timestamp', 'temperature_c', 'expected_min_c', 'expected_max_c', 'breach_c'],
    rows: () =>
      SHIPMENTS.flatMap((s) =>
        SENSOR_READINGS[s.id]
          .filter((r) => !r.inRange)
          .map((r) => ({
            shipment_id: s.id, container_id: s.containerId, cargo: s.cargo, timestamp: r.timestamp, temperature_c: r.temperatureC,
            expected_min_c: s.expectedRange.min, expected_max_c: s.expectedRange.max,
            breach_c: Math.round((r.temperatureC > s.expectedRange.max ? r.temperatureC - s.expectedRange.max : r.temperatureC - s.expectedRange.min) * 10) / 10,
          })),
      ),
  },
  {
    id: 'RPT-004', name: 'Monthly Event Summary', type: 'Operations', hoursAgo: 26,
    description: 'Daily event volume, average temperature and exception counts for the last 30 days.',
    columns: ['date', 'events', 'avg_temperature_c', 'max_temperature_c', 'exceptions'],
    rows: () => {
      const a = buildAnalytics(30)
      return a.volume.map((v, i) => ({
        date: v.label, events: v.events, avg_temperature_c: a.temperature[i].avg, max_temperature_c: a.temperature[i].max, exceptions: a.exceptions[i].exceptions,
      }))
    },
  },
  {
    id: 'RPT-005', name: 'Failed Action Report', type: 'Security', hoursAgo: 5,
    description: 'Rejected commands and failed actions, including concurrency conflicts and schema errors.',
    columns: ['log_id', 'timestamp', 'actor', 'action', 'resource', 'event_type', 'source'],
    rows: () =>
      AUDIT_LOGS.filter((l) => l.status === 'FAILED').map((l) => ({
        log_id: l.id, timestamp: l.timestamp, actor: l.actor, action: l.action, resource: l.resource, event_type: l.eventType ?? '', source: l.source,
      })),
  },
  {
    id: 'RPT-006', name: 'Container Movement Report', type: 'Logistics', hoursAgo: 12,
    description: 'Loading, departure, arrival and delivery events for every container.',
    columns: ['container_id', 'shipment_id', 'event_type', 'timestamp', 'location'],
    rows: () =>
      ALL_EVENTS.filter((e) => ['LOADED_ON_SHIP', 'DEPARTED_PORT', 'ARRIVED_AT_PORT', 'DELIVERED'].includes(e.type))
        .reverse()
        .map((e) => ({
          container_id: SHIPMENTS.find((s) => s.id === e.shipmentId)?.containerId ?? '', shipment_id: e.shipmentId,
          event_type: e.type, timestamp: e.timestamp, location: e.location,
        })),
  },
]

export const REPORT_DEFINITIONS: Array<{ id: string; build: () => ReportData }> = DEFINITIONS.map((d) => ({
  id: d.id,
  build: () => {
    const rows = d.rows()
    const meta: ReportMeta = {
      id: d.id,
      name: d.name,
      description: d.description,
      type: d.type,
      generatedAt: new Date(DEMO_NOW.getTime() - d.hoursAgo * 3600000).toISOString(),
      records: rows.length,
      sizeBytes: new Blob([toCsv(d.columns, rows)]).size,
    }
    return { meta, columns: d.columns, rows }
  },
}))

