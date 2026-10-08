import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import { getReportData, getReports } from '../services/mockApi'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { useToast } from '../context/ToastContext'
import { PageIntro } from '../components/ui/Layout'
import { TableSkeleton } from '../components/ui/Skeleton'
import { ErrorState, NoReports } from '../components/ui/States'
import { Modal } from '../components/ui/Overlays'
import { downloadCsv, downloadJson } from '../utils/download'
import { formatBytes, formatDateTime, formatNumber } from '../utils/format'
import type { ReportData, ReportMeta } from '../types'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function ReportsPage() {
  usePageTitle('Reports')
  const { data, loading, error, reload } = useAsync(getReports, [])
  const { notify } = useToast()
  const [preview, setPreview] = useState<ReportData | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const run = async (meta: ReportMeta, action: 'view' | 'csv' | 'json') => {
    setBusy(`${meta.id}-${action}`)
    setActionError(null)
    try {
      const report = await getReportData(meta.id)
      if (action === 'view') {
        setPreview(report)
        return
      }
      const filename = `${slug(meta.name)}.${action}`
      if (action === 'csv') downloadCsv(filename, report.columns, report.rows)
      else downloadJson(filename, { report: meta.name, generatedAt: meta.generatedAt, records: report.rows.length, data: report.rows })
      notify(`Report downloaded: ${filename}`)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'The report could not be generated.')
    } finally {
      setBusy(null)
    }
  }

  const download = (r: ReportData, format: 'csv' | 'json') => {
    const filename = `${slug(r.meta.name)}.${format}`
    if (format === 'csv') downloadCsv(filename, r.columns, r.rows)
    else downloadJson(filename, { report: r.meta.name, generatedAt: r.meta.generatedAt, records: r.rows.length, data: r.rows })
    notify(`Report downloaded: ${filename}`)
  }

  return (
    <div>
      <PageIntro title="Reports" description="Reports are generated in your browser from the mock event store. Download them as CSV or JSON." />
      {actionError && <div className="mb-4"><ErrorState title="Unable to generate report" message={actionError} onRetry={() => setActionError(null)} /></div>}

      {error ? (
        <ErrorState title="Unable to load reports" message={error} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : !data || data.length === 0 ? (
        <div className="card"><NoReports /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-800">
              <caption className="sr-only">Available reports</caption>
              <thead className="bg-slate-50 dark:bg-ink-800/50">
                <tr>{['Report', 'Type', 'Generated', 'Records', 'Size', 'Action'].map((h) => <th key={h} scope="col" className="th">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-ink-800">
                {data.map((r) => (
                  <tr key={r.id}>
                    <td className="td min-w-[16rem] whitespace-normal">
                      <p className="font-medium">{r.name}</p>
                      <p className="mt-0.5 text-xs muted">{r.description}</p>
                    </td>
                    <td className="td">{r.type}</td>
                    <td className="td tabular-nums">{formatDateTime(r.generatedAt)}</td>
                    <td className="td tabular-nums">{formatNumber(r.records)}</td>
                    <td className="td tabular-nums">{formatBytes(r.sizeBytes)}</td>
                    <td className="td">
                      <div className="flex gap-2">
                        <button type="button" className="btn-secondary" disabled={busy !== null} onClick={() => run(r, 'view')} aria-label={`View ${r.name}`}><Eye className="h-4 w-4" aria-hidden="true" /> View</button>
                        <button type="button" className="btn-secondary" disabled={busy !== null} onClick={() => run(r, 'csv')} aria-label={`Download ${r.name} as CSV`}><Download className="h-4 w-4" aria-hidden="true" /> CSV</button>
                        <button type="button" className="btn-secondary" disabled={busy !== null} onClick={() => run(r, 'json')} aria-label={`Download ${r.name} as JSON`}>JSON</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {preview && (
        <Modal
          title={preview.meta.name}
          subtitle={`${formatNumber(preview.rows.length)} records · generated ${formatDateTime(preview.meta.generatedAt)} · showing first ${Math.min(10, preview.rows.length)}`}
          onClose={() => setPreview(null)}
          footer={
            <>
              <button type="button" className="btn-secondary" onClick={() => download(preview, 'json')}>Download JSON</button>
              <button type="button" className="btn-primary" onClick={() => download(preview, 'csv')}><Download className="h-4 w-4" aria-hidden="true" /> Download CSV</button>
            </>
          }
        >
          {preview.rows.length === 0 ? (
            <p className="py-8 text-center text-sm muted">This report has no records.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-800">
                <thead className="bg-slate-50 dark:bg-ink-800/50"><tr>{preview.columns.map((c) => <th key={c} scope="col" className="th font-mono">{c}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-200 dark:divide-ink-800">
                  {preview.rows.slice(0, 10).map((row, i) => (
                    <tr key={i}>{preview.columns.map((c) => <td key={c} className="td font-mono text-xs">{String(row[c] ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
