export function statusTone(statusRaw: string) {
  const s = (statusRaw || '').toLowerCase()

  // Accept both DB statuses and event-like statuses
  if (s.includes('paid') && !s.includes('partial')) {
    return {
      label: 'Paid',
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/20',
    }
  }

  if (s.includes('partial')) {
    return {
      label: 'Partial Payment',
      dot: 'bg-amber-500',
      badge: 'bg-amber-500/15 text-amber-200 ring-amber-500/20',
    }
  }

  if (s.includes('view')) {
    return {
      label: 'Viewed',
      dot: 'bg-blue-500',
      badge: 'bg-blue-500/15 text-blue-200 ring-blue-500/20',
    }
  }

  if (s.includes('sent') || s.includes('whatsapp')) {
    return {
      label: 'Sent via WhatsApp',
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-500/12 text-emerald-200 ring-emerald-500/20',
    }
  }

  return {
    label: 'Created',
    dot: 'bg-slate-400',
    badge: 'bg-slate-500/15 text-slate-200 ring-slate-500/20',
  }
}
