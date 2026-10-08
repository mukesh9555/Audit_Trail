import { useSettings } from '../context/SettingsContext'

export function useChartTheme() {
  const { settings } = useSettings()
  const dark = settings.theme === 'dark'
  return {
    dark,
    grid: dark ? '#1e293b' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    primary: dark ? '#818cf8' : '#4f46e5',
    primarySoft: dark ? '#818cf866' : '#4f46e533',
    neutral: dark ? '#64748b' : '#94a3b8',
    warning: '#d97706',
    danger: '#dc2626',
    tooltipBg: dark ? '#0f172a' : '#ffffff',
    tooltipBorder: dark ? '#334155' : '#e2e8f0',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
    palette: dark
      ? ['#818cf8', '#94a3b8', '#38bdf8', '#fbbf24', '#2dd4bf', '#a78bfa', '#64748b', '#f87171', '#cbd5e1']
      : ['#4f46e5', '#64748b', '#0ea5e9', '#d97706', '#0d9488', '#7c3aed', '#94a3b8', '#dc2626', '#334155'],
  }
}
