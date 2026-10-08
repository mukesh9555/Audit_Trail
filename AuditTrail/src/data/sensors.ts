import type { SensorReading } from '../types'
import { SHIPMENTS, SHIPMENT_EVENTS } from './shipments'
import { createRng } from '../utils/prng'

const HOUR = 3600000
const round1 = (n: number) => Math.round(n * 10) / 10

function buildReadings(shipmentId: string, seedNum: number): SensorReading[] {
  const shipment = SHIPMENTS.find((s) => s.id === shipmentId)
  const events = SHIPMENT_EVENTS[shipmentId]
  if (!shipment || !events) return []
  const rng = createRng(seedNum * 7919)
  const { min, max } = shipment.expectedRange
  const setpoint = (min + max) / 2
  const spikeEvent = events.find((e) => e.type === 'TEMPERATURE_SPIKE')
  const spikeTemp = spikeEvent && typeof spikeEvent.payload.temperatureC === 'number' ? spikeEvent.payload.temperatureC : null
  const spikeTs = spikeEvent ? new Date(spikeEvent.timestamp).getTime() : 0
  const start = new Date(events[0].timestamp).getTime()
  const end = new Date(events[events.length - 1].timestamp).getTime()

  const tempAt = (t: number): number => {
    let v = setpoint + (rng() - 0.5) * 0.8
    if (spikeTemp !== null) {
      const dt = (t - spikeTs) / HOUR
      if (dt >= -8 && dt < 0) v += (spikeTemp - setpoint) * (1 + dt / 8) * 0.75
      else if (dt >= 0 && dt <= 24) v += (spikeTemp - setpoint) * (1 - dt / 24) * 0.9
    }
    return round1(v)
  }

  const times = new Set<number>()
  for (let t = start; t <= end; t += 4 * HOUR) times.add(t)
  events.forEach((e) => times.add(new Date(e.timestamp).getTime()))

  const readings: SensorReading[] = []
  Array.from(times)
    .sort((a, b) => a - b)
    .forEach((t, idx) => {
      const event = events.find((e) => new Date(e.timestamp).getTime() === t)
      const evTemp = event && typeof event.payload.temperatureC === 'number' ? event.payload.temperatureC : null
      const temperatureC = evTemp ?? tempAt(t)
      readings.push({
        id: `RD-${shipmentId.slice(-3)}-${String(idx + 1).padStart(3, '0')}`,
        shipmentId,
        timestamp: new Date(t).toISOString(),
        temperatureC,
        humidityPct: Math.round(64 + rng() * 14),
        inRange: temperatureC >= min && temperatureC <= max,
      })
    })
  return readings
}

export const SENSOR_READINGS: Record<string, SensorReading[]> = {}
SHIPMENTS.forEach((s, i) => {
  SENSOR_READINGS[s.id] = buildReadings(s.id, i + 1)
})
