import type { AuditLog, LogStatus } from '../types'
import { ALL_EVENTS, SHIPMENT_EVENTS } from './shipments'
import { DEMO_NOW } from '../utils/constants'
import { statusForEvent } from '../utils/eventSourcing'
import { humanizeEvent } from '../utils/format'

function sourceFor(actor: string, i: number): string {
  if (actor === 'Sensor Gateway') return `10.20.4.${12 + (i % 4)} (sensor-gw-0${(i % 4) + 1})`
  if (actor === 'Port Authority Feed') return 'port-feed.internal (EDI)'
  if (actor === 'Vessel Tracker (AIS)') return 'ais-relay.internal'
  if (actor === 'Terminal Operations') return 'terminal-api.internal'
  if (actor === 'Carrier Driver App') return `49.36.${120 + (i % 30)}.${40 + (i % 50)} (mobile)`
  return `103.21.${58 + (i % 6)}.${10 + ((i * 7) % 200)}`
}

const derived: Array<Omit<AuditLog, 'id'>> = ALL_EVENTS.filter((_, i) => i % 3 === 0).map((e, i) => {
  const stream = SHIPMENT_EVENTS[e.shipmentId]
  const prev = e.version > 1 ? statusForEvent(stream[e.version - 2].type) : null
  const status: LogStatus = e.status === 'OK' ? 'SUCCESS' : 'WARNING'
  return {
    timestamp: e.timestamp,
    actor: e.actor,
    action: `Appended ${humanizeEvent(e.type)} event`,
    resource: e.shipmentId,
    eventType: e.type,
    status,
    source: sourceFor(e.actor, i),
    version: e.version,
    previousState: prev ?? 'None (new stream)',
    resultingState: statusForEvent(e.type),
    payload: e.payload,
    metadata: { eventId: e.id, hash: e.hash, correlationId: `corr-${e.id.toLowerCase().replace('evt-', '')}`, schema: 'shipment-event.v2' },
  }
})

const mins = (m: number) => new Date(DEMO_NOW.getTime() - m * 60000).toISOString()

type Manual = Omit<AuditLog, 'id' | 'timestamp'> & { ago: number }
const manual: Manual[] = [
  { ago: 9, actor: 'demo@audittrail.com', action: 'User signed in', resource: 'Session', eventType: null, status: 'SUCCESS', source: '103.21.58.14', version: null, previousState: 'Signed out', resultingState: 'Signed in', payload: null, metadata: { method: 'password', mfa: 'not required (demo)', userAgent: 'Chrome 129 / macOS' } },
  { ago: 33, actor: 'unknown', action: 'Sign-in rejected: invalid credentials', resource: 'Session', eventType: null, status: 'FAILED', source: '185.220.101.47', version: null, previousState: 'Signed out', resultingState: 'Signed out', payload: null, metadata: { attempts: 3, reason: 'invalid_password', rateLimited: 'no' } },
  { ago: 34, actor: 'unknown', action: 'Sign-in rejected: invalid credentials', resource: 'Session', eventType: null, status: 'FAILED', source: '185.220.101.47', version: null, previousState: 'Signed out', resultingState: 'Signed out', payload: null, metadata: { attempts: 2, reason: 'invalid_password', rateLimited: 'no' } },
  { ago: 52, actor: 'S. Tan', action: 'Append rejected: 409 CONFLICT (stale version)', resource: 'SHP-2026-004', eventType: 'INSPECTION_STARTED', status: 'FAILED', source: '103.21.59.88', version: 5, previousState: 'At Port', resultingState: 'Unchanged (command rejected)', payload: { expectedVersion: 5, actualVersion: 6, command: 'AppendEvent' }, metadata: { httpStatus: 409, strategy: 'optimistic concurrency', retryAdvised: 'yes' } },
  { ago: 71, actor: 'L. Verhoeven', action: 'Exported Temperature Exception Report', resource: 'RPT-003', eventType: null, status: 'SUCCESS', source: '103.21.60.201', version: null, previousState: null, resultingState: null, payload: { format: 'CSV', records: 12 }, metadata: { reportId: 'RPT-003', durationMs: 412 } },
  { ago: 118, actor: 'Sensor Gateway', action: 'Ingest delayed: upstream timeout', resource: 'sensor-gw-03', eventType: null, status: 'WARNING', source: '10.20.4.14 (sensor-gw-03)', version: null, previousState: 'Healthy', resultingState: 'Degraded', payload: { delayedMs: 4180, retries: 2 }, metadata: { component: 'ingest', recovered: 'yes' } },
  { ago: 160, actor: 'M. Haddad', action: 'Replayed shipment state to historical timestamp', resource: 'SHP-2026-007', eventType: null, status: 'SUCCESS', source: '103.21.58.77', version: 5, previousState: 'Cleared (v7)', resultingState: 'At Port (v5, historical)', payload: { eventsReplayed: 5, asOf: 'v5' }, metadata: { readOnly: 'true', durationMs: 18 } },
  { ago: 205, actor: 'Projection Worker', action: 'Rebuilt read model shipments_view', resource: 'projection/shipments_view', eventType: null, status: 'SUCCESS', source: 'projector-02.internal', version: null, previousState: 'Lag 1.8s', resultingState: 'Lag 0.4s', payload: { eventsProcessed: 8942, checkpoint: 'seq-3318841' }, metadata: { pattern: 'CQRS', durationMs: 5320 } },
  { ago: 260, actor: 'K. Schulz', action: 'Permission denied: delete event', resource: 'SHP-2026-014', eventType: 'TEMPERATURE_SPIKE', status: 'FAILED', source: '103.21.61.19', version: 4, previousState: 'Temperature Alert', resultingState: 'Unchanged (events are immutable)', payload: { attemptedOperation: 'DELETE' }, metadata: { policy: 'append-only', httpStatus: 405 } },
  { ago: 330, actor: 'Port Authority Feed', action: 'Duplicate message ignored (idempotency key)', resource: 'SHP-2026-012', eventType: 'ARRIVED_AT_PORT', status: 'WARNING', source: 'port-feed.internal (EDI)', version: 5, previousState: 'At Port', resultingState: 'Unchanged', payload: { idempotencyKey: 'edi-9918-5521', duplicates: 1 }, metadata: { deduplicated: 'true' } },
  { ago: 420, actor: 'R. Iyer', action: 'Updated notification preferences', resource: 'Account settings', eventType: null, status: 'SUCCESS', source: '103.21.58.140', version: null, previousState: 'Weekly digest: off', resultingState: 'Weekly digest: on', payload: { field: 'weeklyDigest', value: true }, metadata: { scope: 'user' } },
  { ago: 505, actor: 'Terminal Operations', action: 'Schema validation failed', resource: 'SHP-2026-006', eventType: 'LOADED_ON_SHIP', status: 'FAILED', source: 'terminal-api.internal', version: 3, previousState: 'Loaded', resultingState: 'Unchanged (command rejected)', payload: { error: 'voyage is required', field: 'voyage' }, metadata: { httpStatus: 422, schema: 'shipment-event.v2' } },
  { ago: 740, actor: 'System Scheduler', action: 'Retention policy check completed', resource: 'event-store', eventType: null, status: 'SUCCESS', source: 'scheduler.internal', version: null, previousState: null, resultingState: null, payload: { streamsChecked: 1284, eventsPurged: 0 }, metadata: { policy: '7-year retention', mode: 'verify only' } },
  { ago: 1210, actor: 'A. Menon', action: 'Rotated API key', resource: 'integration/port-feed', eventType: null, status: 'SUCCESS', source: '103.21.58.14', version: null, previousState: 'Key ****a91c', resultingState: 'Key ****7e20', payload: { keyId: 'key_port_feed_02' }, metadata: { scope: 'integration' } },
]

export const AUDIT_LOGS: AuditLog[] = [
  ...derived,
  ...manual.map(({ ago, ...rest }) => ({ ...rest, timestamp: mins(ago) })),
]
  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  .map((l, i) => ({ ...l, id: `LOG-${1001 + i}` }))
