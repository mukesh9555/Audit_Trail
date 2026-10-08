import type { AnalyticsData, DashboardData, RangeDays } from '../types'
import { ALL_EVENTS, SHIPMENTS } from './shipments'
import { DEMO_NOW } from '../utils/constants'
import { createRng } from '../utils/prng'
import { formatShortDate } from '../utils/format'

const DAY = 86400000

const FLEET_STATUS: Array<{ name: string; value: number }> = [
  { name: 'Created', value: 31 },
  { name: 'Loaded', value: 47 },
  { name: 'In Transit', value: 121 },
  { name: 'Temperature Alert', value: 17 },
  { name: 'At Port', value: 52 },
  { name: 'Under Inspection', value: 41 },
  { name: 'Cleared', value: 17 },
]

/** Share of one day's events by type (sums to 8,942 for "today"). */
const TODAY_BY_TYPE: Array<{ name: string; value: number }> = [
  { name: 'SENSOR_READING', value: 4544 },
  { name: 'LOADED_ON_SHIP', value: 731 },
  { name: 'DEPARTED_PORT', value: 702 },
  { name: 'ARRIVED_AT_PORT', value: 655 },
  { name: 'CONTAINER_CREATED', value: 604 },
  { name: 'INSPECTION_STARTED', value: 540 },
  { name: 'INSPECTION_COMPLETED', value: 497 },
  { name: 'DELIVERED', value: 486 },
  { name: 'TEMPERATURE_SPIKE', value: 183 },
]

const dayLabel = (daysAgo: number) => formatShortDate(new Date(DEMO_NOW.getTime() - daysAgo * DAY).toISOString())

export function buildDashboard(): DashboardData {
  const rng = createRng(14)
  const days = 14
  const activity = Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i
    const weekend = [0, 6].includes(new Date(DEMO_NOW.getTime() - daysAgo * DAY).getUTCDay())
    const events = daysAgo === 0 ? 8942 : Math.round((weekend ? 7300 : 8500) + rng() * 900)
    return { label: dayLabel(daysAgo), events, shipments: Math.round(events / 28 + rng() * 6) }
  })

  const exceptions = SHIPMENTS.filter((s) => s.risk === 'High' || s.status === 'Temperature Alert')
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .map((s) => {
      const spike = SHIPMENTS.length ? ALL_EVENTS.find((e) => e.shipmentId === s.id && e.type === 'TEMPERATURE_SPIKE') : undefined
      const temp = spike && typeof spike.payload.temperatureC === 'number' ? spike.payload.temperatureC : null
      return {
        shipmentId: s.id,
        containerId: s.containerId,
        message: temp !== null
          ? `Reefer at ${temp}°C, expected ${s.expectedRange.min}–${s.expectedRange.max}°C`
          : `Risk level ${s.risk}`,
        since: spike?.timestamp ?? s.lastUpdated,
        severity: s.risk,
      }
    })

  return {
    stats: { totalShipments: 1284, activeShipments: 326, eventsToday: 8942, exceptions: 17 },
    activity,
    eventsByType: TODAY_BY_TYPE,
    statusDistribution: FLEET_STATUS,
    recentEvents: ALL_EVENTS.slice(0, 8),
    exceptions,
    health: [
      { name: 'Event Store', detail: 'Append-only log, 3 replicas', status: 'Operational', metric: 'p99 append 14 ms' },
      { name: 'Command Handler', detail: 'Optimistic concurrency checks', status: 'Operational', metric: '99.98% accepted' },
      { name: 'Projection Workers', detail: 'CQRS read model builders', status: 'Operational', metric: 'Lag 0.4 s' },
      { name: 'Sensor Gateway', detail: '1 of 12 ingest nodes slow', status: 'Degraded', metric: 'p95 212 ms' },
    ],
  }
}

export function buildAnalytics(range: RangeDays): AnalyticsData {
  const rng = createRng(range * 31)
  const volume: AnalyticsData['volume'] = []
  const temperature: AnalyticsData['temperature'] = []
  const exceptions: AnalyticsData['exceptions'] = []
  let total = 0
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(DEMO_NOW.getTime() - i * DAY)
    const weekend = [0, 6].includes(d.getUTCDay())
    const events = Math.round((weekend ? 7200 : 8400) + rng() * 1000 + (range - i) * 3)
    const label = formatShortDate(d.toISOString())
    total += events
    volume.push({ label, events })
    const avg = Math.round((4.4 + rng() * 0.7) * 10) / 10
    temperature.push({ label, avg, max: Math.round((avg + 1.6 + rng() * 2.6) * 10) / 10 })
    exceptions.push({ label, exceptions: Math.round(9 + rng() * 14) })
  }
  const share = total / Object.values(TODAY_BY_TYPE).reduce((s, t) => s + t.value, 0)
  const deliveredByRange: Record<RangeDays, number> = { 7: 214, 30: 861, 90: 2540 }
  return {
    range,
    volume,
    temperature,
    exceptions,
    statusDistribution: [...FLEET_STATUS, { name: 'Delivered', value: deliveredByRange[range] }],
    eventsByType: TODAY_BY_TYPE.map((t) => ({ name: t.name, value: Math.round(t.value * share) })),
  }
}
