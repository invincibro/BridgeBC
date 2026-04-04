// Card is a small reusable panel wrapper for metrics, lists, and summaries.
function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`panel p-6 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export default Card
