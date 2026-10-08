import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartTheme } from '../../hooks/useChartTheme'
import type { SensorReading } from '../../types'
import { formatDateTime, formatNumber, humanizeEvent } from '../../utils/format'

function useTooltipStyle() {
  const t = useChartTheme()
  return {
    contentStyle: { background: t.tooltipBg, border: `1px solid ${t.tooltipBorder}`, borderRadius: 8, fontSize: 12, color: t.tooltipText },
    labelStyle: { color: t.tooltipText, fontWeight: 600 },
    itemStyle: { color: t.tooltipText },
  }
}

const tick = (color: string) => ({ fontSize: 11, fill: color })

export function ActivityChart({ data }: { data: Array<{ label: string; events: number; shipments: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <div role="img" aria-label="Chart of events appended and shipments touched per day over the last 14 days" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey="label" tick={tick(t.axis)} tickLine={false} axisLine={{ stroke: t.grid }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis yAxisId="l" tick={tick(t.axis)} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <YAxis yAxisId="r" orientation="right" tick={tick(t.axis)} tickLine={false} axisLine={false} />
          <Tooltip {...tip} formatter={(v: number) => formatNumber(v)} />
          <Legend wrapperStyle={{ fontSize: 12, color: t.axis }} />
          <Area yAxisId="l" type="monotone" dataKey="events" name="Events appended" stroke={t.primary} fill={t.primarySoft} strokeWidth={2} />
          <Area yAxisId="r" type="monotone" dataKey="shipments" name="Shipments touched" stroke={t.neutral} fill="transparent" strokeWidth={1.5} strokeDasharray="4 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function VolumeChart({ data }: { data: Array<{ label: string; events: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <div role="img" aria-label="Area chart of daily event volume" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey="label" tick={tick(t.axis)} tickLine={false} axisLine={{ stroke: t.grid }} minTickGap={28} />
          <YAxis tick={tick(t.axis)} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
          <Tooltip {...tip} formatter={(v: number) => formatNumber(v)} />
          <Area type="monotone" dataKey="events" name="Events" stroke={t.primary} fill={t.primarySoft} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TemperatureTrendChart({ data }: { data: Array<{ label: string; avg: number; max: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <div role="img" aria-label="Line chart of average and maximum container temperature" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey="label" tick={tick(t.axis)} tickLine={false} axisLine={{ stroke: t.grid }} minTickGap={28} />
          <YAxis tick={tick(t.axis)} tickLine={false} axisLine={false} unit="°" domain={[0, 'dataMax + 1']} />
          <Tooltip {...tip} formatter={(v: number) => `${v}°C`} />
          <Legend wrapperStyle={{ fontSize: 12, color: t.axis }} />
          <ReferenceLine y={6} stroke={t.warning} strokeDasharray="4 3" label={{ value: 'Upper limit 6°C', fill: t.axis, fontSize: 11, position: 'insideTopLeft' }} />
          <Line type="monotone" dataKey="avg" name="Average" stroke={t.primary} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="max" name="Peak" stroke={t.neutral} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExceptionsChart({ data }: { data: Array<{ label: string; exceptions: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  return (
    <div role="img" aria-label="Bar chart of exceptions per day" className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey="label" tick={tick(t.axis)} tickLine={false} axisLine={{ stroke: t.grid }} minTickGap={28} />
          <YAxis tick={tick(t.axis)} tickLine={false} axisLine={false} />
          <Tooltip {...tip} cursor={{ fill: t.grid }} />
          <Bar dataKey="exceptions" name="Exceptions" fill={t.warning} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EventTypeChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  const rows = data.map((d) => ({ ...d, label: d.name === 'SENSOR_READING' ? 'Sensor reading' : humanizeEvent(d.name) }))
  return (
    <div role="img" aria-label="Bar chart of event counts by type" className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} horizontal={false} />
          <XAxis type="number" tick={tick(t.axis)} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatNumber(v)} />
          <YAxis type="category" dataKey="label" width={150} tick={tick(t.axis)} tickLine={false} axisLine={false} />
          <Tooltip {...tip} cursor={{ fill: t.grid }} formatter={(v: number) => formatNumber(v)} />
          <Bar dataKey="value" name="Events" fill={t.primary} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StatusDonut({ data }: { data: Array<{ name: string; value: number }> }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex flex-col items-center gap-4">
      <div role="img" aria-label="Donut chart of shipment status distribution" className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie isAnimationActive={false} data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((d, i) => (
                <Cell key={d.name} fill={t.palette[i % t.palette.length]} />
              ))}
            </Pie>
            <Tooltip {...tip} formatter={(v: number) => formatNumber(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: t.palette[i % t.palette.length] }} aria-hidden="true" />
              <span>{d.name}</span>
            </span>
            <span className="tabular-nums muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SensorChart({ data, min, max }: { data: SensorReading[]; min: number; max: number }) {
  const t = useChartTheme()
  const tip = useTooltipStyle()
  const rows = data.map((r) => ({ ts: r.timestamp, temp: r.temperatureC }))
  const peak = Math.max(max + 1, ...rows.map((r) => r.temp)) + 1
  return (
    <div role="img" aria-label={`Temperature readings with expected range ${min} to ${max} degrees Celsius`} className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <ReferenceArea y1={min} y2={max} fill={t.primary} fillOpacity={0.08} />
          <XAxis dataKey="ts" tick={tick(t.axis)} tickLine={false} axisLine={{ stroke: t.grid }} minTickGap={40} tickFormatter={(v: string) => formatDateTime(v).slice(0, 6)} />
          <YAxis tick={tick(t.axis)} tickLine={false} axisLine={false} unit="°" domain={[0, Math.ceil(peak)]} />
          <Tooltip {...tip} labelFormatter={(v: string) => formatDateTime(v)} formatter={(v: number) => [`${v}°C`, 'Temperature']} />
          <ReferenceLine y={max} stroke={t.warning} strokeDasharray="4 3" />
          <Line type="monotone" dataKey="temp" stroke={t.primary} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
