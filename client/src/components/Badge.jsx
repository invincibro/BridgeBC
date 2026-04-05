// Badge standardizes status and metadata labels across pages.
const badgeStyles = {
  default: 'bg-[#f4ece1] text-[#2F3E46]',
  success: 'bg-[#e5f4e7] text-[#2e6840]',
  warning: 'bg-[#fff1d6] text-[#9a6322]',
  danger: 'bg-[#ffe4d7] text-[#a44e25]',
  info: 'bg-[#e5f2ec] text-[#36685b]',
}

function Badge({ children, tone = 'default' }) {
  return (
    <span
      className={`inline-flex max-w-full whitespace-normal break-words rounded-full px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-[0.12em] leading-5 transition duration-200 ${
        badgeStyles[tone] || badgeStyles.default
      }`}
    >
      {children}
    </span>
  )
}

export default Badge
