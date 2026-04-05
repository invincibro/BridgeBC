// Card is a small reusable panel wrapper for metrics, lists, and summaries.
function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`panel p-7 ${className} mt-4`}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h3 className="text-xl font-semibold text-[#2F3E46]">{title}</h3>}
          {subtitle && <p className="mt-2 text-sm text-[#6B7280]">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export default Card
