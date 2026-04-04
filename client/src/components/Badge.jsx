// Badge standardizes status and metadata labels across pages.
const badgeStyles = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-orange-100 text-orange-800',
  info: 'bg-sky-100 text-sky-800',
}

function Badge({ children, tone = 'default' }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        badgeStyles[tone] || badgeStyles.default
      }`}
    >
      {children}
    </span>
  )
}

export default Badge
