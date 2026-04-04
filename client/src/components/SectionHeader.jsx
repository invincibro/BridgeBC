// SectionHeader keeps section titles and helper copy visually consistent.
function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-moss">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-slate-600">{description}</p>}
    </div>
  )
}

export default SectionHeader
