import type {
  AnalyticsData, AuditLog, DashboardData, RangeDays, ReconstructedState, ReportData, ReportMeta,
  SearchResults, SensorReading, Shipment, ShipmentEvent,
} from '../types'
import { ALL_EVENTS, SHIPMENTS, SHIPMENT_EVENTS } from '../data/shipments'
import { AUDIT_LOGS } from '../data/auditLogs'
import { SENSOR_READINGS } from '../data/sensors'
import { buildAnalytics, buildDashboard } from '../data/metrics'
import { REPORT_DEFINITIONS } from '../data/reports'
import { replay } from '../utils/eventSourcing'

/**
 * Mock service layer. Every function returns a Promise and simulates network latency,
 * so the UI is structured exactly as it would be against a real read/query API.
 */

let failNext = false

/** Arms a one-shot failure so the next request rejects (used to demo the error state). */
export function armFailure(): void {
  failNext = true
}

function respond<T>(produce: () => T, latency = 350): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    window.setTimeout(() => {
      if (failNext) {
        failNext = false
        reject(new Error('Request failed (simulated). The event store did not respond in time.'))
        return
      }
      try {
        resolve(structuredClone(produce()))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Unexpected error'))
      }
    }, latency + Math.round(Math.random() * 120))
  })
}

export function getShipments(): Promise<Shipment[]> {
  return respond(() => SHIPMENTS)
}

export function getShipmentById(id: string): Promise<Shipment> {
  return respond(() => {
    const s = SHIPMENTS.find((x) => x.id === id)
    if (!s) throw new Error(`Shipment ${id} was not found.`)
    return s
  })
}

export function getShipmentEvents(id: string): Promise<ShipmentEvent[]> {
  return respond(() => {
    const events = SHIPMENT_EVENTS[id]
    if (!events) throw new Error(`No event stream exists for ${id}.`)
    return events
  })
}

export function getAuditLogs(): Promise<AuditLog[]> {
  return respond(() => AUDIT_LOGS)
}

export function getSensorData(id: string): Promise<SensorReading[]> {
  return respond(() => SENSOR_READINGS[id] ?? [])
}

/** Replays all events up to (and including) the given timestamp to rebuild state. */
export function reconstructState(id: string, timestamp: string): Promise<ReconstructedState> {
  return respond(() => {
    const events = SHIPMENT_EVENTS[id]
    const shipment = SHIPMENTS.find((s) => s.id === id)
    if (!events || !shipment) throw new Error(`Cannot reconstruct state: ${id} was not found.`)
    const cutoff = new Date(timestamp).getTime()
    const applied = events.filter((e) => new Date(e.timestamp).getTime() <= cutoff)
    const state = replay(applied, shipment.containerId, events.length)
    if (!state) throw new Error('No events exist at or before the selected time.')
    return state
  }, 90)
}

export function getReports(): Promise<ReportMeta[]> {
  return respond(() => REPORT_DEFINITIONS.map((r) => r.build().meta))
}

export function getReportData(id: string): Promise<ReportData> {
  return respond(() => {
    const def = REPORT_DEFINITIONS.find((r) => r.id === id)
    if (!def) throw new Error(`Report ${id} was not found.`)
    return def.build()
  }, 200)
}

export function getDashboard(): Promise<DashboardData> {
  return respond(() => buildDashboard())
}

export function getAnalytics(range: RangeDays): Promise<AnalyticsData> {
  return respond(() => buildAnalytics(range), 300)
}

export function search(query: string): Promise<SearchResults> {
  return respond(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { shipments: [], events: [], logs: [] }
    const has = (...vals: Array<string | null | undefined>) => vals.some((v) => v?.toLowerCase().includes(q))
    return {
      shipments: SHIPMENTS.filter((s) => has(s.id, s.containerId, s.origin, s.destination, s.cargo)).slice(0, 5),
      events: ALL_EVENTS.filter((e) => has(e.id, e.type, e.actor, e.shipmentId, e.location)).slice(0, 5),
      logs: AUDIT_LOGS.filter((l) => has(l.id, l.actor, l.action, l.resource)).slice(0, 5),
    }
  }, 120)
}
