import type { ReconstructedState, RiskLevel, ShipmentEvent, ShipmentStatus } from '../types'

const STATUS_BY_EVENT: Record<ShipmentEvent['type'], ShipmentStatus> = {
  CONTAINER_CREATED: 'Created',
  LOADED_ON_SHIP: 'Loaded',
  DEPARTED_PORT: 'In Transit',
  TEMPERATURE_SPIKE: 'Temperature Alert',
  ARRIVED_AT_PORT: 'At Port',
  INSPECTION_STARTED: 'Under Inspection',
  INSPECTION_COMPLETED: 'Cleared',
  DELIVERED: 'Delivered',
}

export function statusForEvent(type: ShipmentEvent['type']): ShipmentStatus {
  return STATUS_BY_EVENT[type]
}

/**
 * Pure reducer: applies a single event to a state. Current state is never stored;
 * it is always the fold of the event history.
 */
export function applyEvent(
  state: ReconstructedState | null,
  event: ShipmentEvent,
  containerId: string,
  totalEvents: number,
): ReconstructedState {
  const temp = typeof event.payload.temperatureC === 'number' ? event.payload.temperatureC : (state?.temperatureC ?? null)
  const riskPayload = event.payload.riskLevel
  const risk: RiskLevel =
    riskPayload === 'Low' || riskPayload === 'Medium' || riskPayload === 'High' ? riskPayload : (state?.risk ?? 'Low')
  return {
    shipmentId: event.shipmentId,
    containerId,
    location: event.location,
    status: STATUS_BY_EVENT[event.type],
    temperatureC: temp,
    risk,
    version: event.version,
    eventCount: (state?.eventCount ?? 0) + 1,
    totalEvents,
    asOf: event.timestamp,
    lastEventType: event.type,
  }
}

export function replay(events: ShipmentEvent[], containerId: string, totalEvents = events.length): ReconstructedState | null {
  return events.reduce<ReconstructedState | null>((s, e) => applyEvent(s, e, containerId, totalEvents), null)
}
