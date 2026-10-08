import { useEffect } from 'react'

export const SITE_TITLE = 'AuditTrail — Event-Sourced Inventory & Logistics Ledger'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · AuditTrail` : SITE_TITLE
  }, [title])
}
