export type EnterpriseStatus = 'created' | 'sent' | 'viewed' | 'partial' | 'paid'

export const enterpriseStatusOrder: EnterpriseStatus[] = ['created', 'sent', 'viewed', 'partial', 'paid']

export const enterpriseStatusMap: Record<EnterpriseStatus, {
  label: string
  dotClass: string
  glowClass: string
  badgeClass: string
}> = {
  created: {
    label: 'Created',
    dotClass: 'bg-slate-400',
    glowClass: '',
    badgeClass: 'bg-slate-500/15 text-slate-200',
  },
  sent: {
    label: 'Sent via WhatsApp',
    dotClass: 'bg-[#25D366]',
    glowClass: 'shadow-[0_0_14px_rgba(37,211,102,0.65)]',
    badgeClass: 'bg-[#25D366]/15 text-[#25D366]',
  },
  viewed: {
    label: 'Viewed',
    dotClass: 'bg-blue-500',
    glowClass: 'shadow-[0_0_14px_rgba(59,130,246,0.60)]',
    badgeClass: 'bg-blue-500/15 text-blue-300',
  },
  partial: {
    label: 'Partial Payment',
    dotClass: 'bg-amber-500',
    glowClass: 'shadow-[0_0_14px_rgba(245,158,11,0.65)]',
    badgeClass: 'bg-amber-500/15 text-amber-200',
  },
  paid: {
    label: 'Paid',
    dotClass: 'bg-emerald-500',
    glowClass: 'shadow-[0_0_18px_rgba(16,185,129,0.70)]',
    badgeClass: 'bg-emerald-500/15 text-emerald-200',
  },
}
