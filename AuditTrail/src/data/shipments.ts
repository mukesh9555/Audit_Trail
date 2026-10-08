import type { EventStatus, EventType, Payload, RiskLevel, Shipment, ShipmentEvent } from '../types'
import { DEMO_NOW, EVENT_SEQUENCE } from '../utils/constants'
import { chainHash } from '../utils/hash'
import { replay } from '../utils/eventSourcing'

interface Cargo {
  min: number
  max: number
}

const CARGO: Record<string, Cargo> = {
  Pharmaceuticals: { min: 2, max: 6 },
  'Dairy products': { min: 1, max: 5 },
  'Fresh produce': { min: 4, max: 8 },
  'Biologics (vaccines)': { min: 2, max: 8 },
  'Cut flowers': { min: 3, max: 8 },
}

interface Seed {
  n: number
  container: string
  origin: string
  destination: string
  cargo: keyof typeof CARGO
  vessel: string
  region: string
  /** number of events appended so far (1–8) */
  stage: number
  lastAgoMin: number
  spike?: number
  /** risk level recorded after spike, arrival and inspection completion */
  risks: [RiskLevel, RiskLevel, RiskLevel]
}

const SEEDS: Seed[] = [
  { n: 1, container: 'CONT-AX72K9', origin: 'Mumbai', destination: 'Rotterdam', cargo: 'Pharmaceuticals', vessel: 'MV Aurora Bay', region: 'Arabian Sea', stage: 4, lastAgoMin: 2, spike: 8.7, risks: ['High', 'Medium', 'Low'] },
  { n: 2, container: 'CONT-BX18P4', origin: 'Chennai', destination: 'Singapore', cargo: 'Fresh produce', vessel: 'MV Coromandel Star', region: 'Bay of Bengal', stage: 5, lastAgoMin: 18, spike: 8.6, risks: ['Low', 'Low', 'Low'] },
  { n: 3, container: 'CONT-CX55M2', origin: 'Dubai', destination: 'Hamburg', cargo: 'Dairy products', vessel: 'MV Jebel Ali Express', region: 'Gulf of Aden', stage: 3, lastAgoMin: 46, risks: ['Low', 'Low', 'Low'] },
  { n: 4, container: 'CONT-DX09T7', origin: 'Singapore', destination: 'Rotterdam', cargo: 'Biologics (vaccines)', vessel: 'MV Straits Pioneer', region: 'Strait of Malacca', stage: 6, lastAgoMin: 95, spike: 8.9, risks: ['Medium', 'Medium', 'Low'] },
  { n: 5, container: 'CONT-EX41R8', origin: 'Hamburg', destination: 'Mumbai', cargo: 'Pharmaceuticals', vessel: 'MV Elbe Voyager', region: 'Red Sea', stage: 8, lastAgoMin: 1380, spike: 6.6, risks: ['Low', 'Low', 'Low'] },
  { n: 6, container: 'CONT-FX63L1', origin: 'Rotterdam', destination: 'Dubai', cargo: 'Cut flowers', vessel: 'MV Maas Carrier', region: 'Bay of Biscay', stage: 2, lastAgoMin: 210, risks: ['Low', 'Low', 'Low'] },
  { n: 7, container: 'CONT-GX27Q5', origin: 'Mumbai', destination: 'Hamburg', cargo: 'Dairy products', vessel: 'MV Konkan Queen', region: 'Arabian Sea', stage: 7, lastAgoMin: 340, spike: 6.3, risks: ['Medium', 'Medium', 'Medium'] },
  { n: 8, container: 'CONT-HX84W3', origin: 'Chennai', destination: 'Felixstowe', cargo: 'Biologics (vaccines)', vessel: 'MV Madras Meridian', region: 'Indian Ocean', stage: 4, lastAgoMin: 27, spike: 11.4, risks: ['High', 'Medium', 'Medium'] },
  { n: 9, container: 'CONT-JX36D6', origin: 'Dubai', destination: 'Singapore', cargo: 'Fresh produce', vessel: 'MV Gulf Navigator', region: 'Arabian Sea', stage: 1, lastAgoMin: 600, risks: ['Low', 'Low', 'Low'] },
  { n: 10, container: 'CONT-KX72N0', origin: 'Singapore', destination: 'Hamburg', cargo: 'Cut flowers', vessel: 'MV Lion City', region: 'South China Sea', stage: 3, lastAgoMin: 75, risks: ['Low', 'Low', 'Low'] },
  { n: 11, container: 'CONT-LX19V4', origin: 'Rotterdam', destination: 'Chennai', cargo: 'Pharmaceuticals', vessel: 'MV Delta Horizon', region: 'Mediterranean Sea', stage: 8, lastAgoMin: 4300, spike: 6.9, risks: ['Low', 'Low', 'Low'] },
  { n: 12, container: 'CONT-MX58Z9', origin: 'Felixstowe', destination: 'Dubai', cargo: 'Dairy products', vessel: 'MV Orwell Trader', region: 'English Channel', stage: 5, lastAgoMin: 130, spike: 5.9, risks: ['Low', 'Low', 'Low'] },
  { n: 13, container: 'CONT-NX03B2', origin: 'Mumbai', destination: 'Singapore', cargo: 'Fresh produce', vessel: 'MV Sahyadri', region: 'Andaman Sea', stage: 6, lastAgoMin: 60, spike: 8.4, risks: ['Medium', 'Medium', 'Low'] },
  { n: 14, container: 'CONT-PX90H7', origin: 'Hamburg', destination: 'Dubai', cargo: 'Biologics (vaccines)', vessel: 'MV Hanse Spirit', region: 'North Sea', stage: 4, lastAgoMin: 410, spike: 9.1, risks: ['Medium', 'Medium', 'Low'] },
  { n: 15, container: 'CONT-QX46C1', origin: 'Dubai', destination: 'Rotterdam', cargo: 'Cut flowers', vessel: 'MV Palm Crescent', region: 'Gulf of Aden', stage: 7, lastAgoMin: 880, spike: 8.5, risks: ['Medium', 'Low', 'Low'] },
]

/** Hours elapsed between event i-1 and event i. */
const GAP_HOURS = [0, 20, 8, 41, 63, 7, 14, 26]
const CREATORS = ['A. Menon', 'S. Tan', 'L. Verhoeven', 'M. Haddad', 'K. Schulz', 'R. Iyer']
const INSPECTORS = ['Insp. J. Okafor', 'Insp. P. Nair', 'Insp. E. de Vries', 'Insp. F. Weber']
const round1 = (n: number) => Math.round(n * 10) / 10
const pad = (n: number, w = 3) => String(n).padStart(w, '0')

function buildEvents(seed: Seed): ShipmentEvent[] {
  const { min, max } = CARGO[seed.cargo]
  const setpoint = round1((min + max) / 2)
  const shipmentId = `SHP-2026-${pad(seed.n)}`
  const lastTs = DEMO_NOW.getTime() - seed.lastAgoMin * 60000
  const spike = seed.spike ?? setpoint + 2

  const tsFor = (i: number): number => {
    let ts = lastTs
    for (let k = i + 1; k < seed.stage; k++) ts -= GAP_HOURS[k] * 3600000
    return ts
  }

  const events: ShipmentEvent[] = []
  let prevHash = '00000000'

  for (let i = 0; i < seed.stage; i++) {
    const type: EventType = EVENT_SEQUENCE[i]
    const base = { temperatureC: setpoint } as Payload
    let payload: Payload = base
    let actor = ''
    let location = ''
    let status: EventStatus = 'OK'

    switch (type) {
      case 'CONTAINER_CREATED':
        actor = CREATORS[seed.n % CREATORS.length]
        location = seed.origin
        payload = { temperatureC: setpoint, cargo: seed.cargo, setpointC: setpoint, expectedMinC: min, expectedMaxC: max, bookingRef: `BK-${20260000 + seed.n * 37}`, weightKg: 12000 + seed.n * 640 }
        break
      case 'LOADED_ON_SHIP':
        actor = 'Terminal Operations'
        location = `${seed.origin} Container Terminal`
        payload = { temperatureC: round1(setpoint + 0.2), vessel: seed.vessel, voyage: `V${240 + seed.n}E`, berth: `B${(seed.n % 9) + 1}` }
        break
      case 'DEPARTED_PORT':
        actor = 'Vessel Tracker (AIS)'
        location = `${seed.origin} — outbound channel`
        payload = { temperatureC: round1(setpoint - 0.1), vessel: seed.vessel, nextPort: seed.destination }
        break
      case 'TEMPERATURE_SPIKE':
        actor = 'Sensor Gateway'
        location = seed.region
        status = spike > max + 3 ? 'CRITICAL' : 'WARNING'
        payload = {
          temperatureC: spike,
          expectedMinC: min,
          expectedMaxC: max,
          breachC: round1(spike - max),
          durationMin: 25 + seed.n * 4,
          sensorId: `SNS-${seed.container.slice(-4)}`,
          riskLevel: seed.risks[0],
        }
        break
      case 'ARRIVED_AT_PORT':
        actor = 'Port Authority Feed'
        location = `${seed.destination} Port`
        payload = { temperatureC: round1(setpoint + 0.6), port: seed.destination, berth: `Q${(seed.n % 12) + 1}`, riskLevel: seed.risks[1] }
        break
      case 'INSPECTION_STARTED':
        actor = INSPECTORS[seed.n % INSPECTORS.length]
        location = `${seed.destination} — Customs Bay ${(seed.n % 4) + 1}`
        payload = { temperatureC: round1(setpoint + 0.3), inspectionId: `INS-2026-${pad(seed.n + 400)}`, authority: 'Port Health & Customs' }
        break
      case 'INSPECTION_COMPLETED':
        actor = INSPECTORS[seed.n % INSPECTORS.length]
        location = `${seed.destination} — Customs Bay ${(seed.n % 4) + 1}`
        payload = {
          temperatureC: round1(setpoint + 0.1),
          inspectionId: `INS-2026-${pad(seed.n + 400)}`,
          outcome: seed.risks[2] === 'Low' ? 'Passed' : 'Released with notes',
          riskLevel: seed.risks[2],
        }
        break
      case 'DELIVERED':
        actor = 'Carrier Driver App'
        location = `${seed.destination} — Consignee Depot`
        payload = { temperatureC: setpoint, consignee: `${seed.destination} Cold Chain Logistics`, proofOfDelivery: `POD-${pad(seed.n * 113, 5)}` }
        break
    }

    const id = `EVT-${pad(seed.n)}-${pad(i + 1, 2)}`
    const timestamp = new Date(tsFor(i)).toISOString()
    const hash = chainHash(prevHash, `${id}|${type}|${timestamp}|${i + 1}|${JSON.stringify(payload)}`)
    events.push({ id, shipmentId, version: i + 1, type, timestamp, actor, location, status, payload, hash, prevHash })
    prevHash = hash
  }
  return events
}

export const SHIPMENT_EVENTS: Record<string, ShipmentEvent[]> = {}
export const SHIPMENTS: Shipment[] = SEEDS.map((seed) => {
  const events = buildEvents(seed)
  const id = events[0].shipmentId
  SHIPMENT_EVENTS[id] = events
  const state = replay(events, seed.container)
  const last = events[events.length - 1]
  if (!state) throw new Error(`Empty stream for ${id}`)
  return {
    id,
    containerId: seed.container,
    origin: seed.origin,
    destination: seed.destination,
    cargo: seed.cargo,
    vessel: seed.vessel,
    status: state.status,
    lastEvent: last.type,
    lastUpdated: last.timestamp,
    risk: state.risk,
    version: state.version,
    expectedRange: { min: CARGO[seed.cargo].min, max: CARGO[seed.cargo].max },
  }
})

export const ALL_EVENTS: ShipmentEvent[] = Object.values(SHIPMENT_EVENTS)
  .flat()
  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
