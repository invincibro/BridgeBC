function FormField({ label, htmlFor, required = false, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-[#2F3E46]">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
      </label>
      {hint && <p className="mb-3 text-sm text-[#6B7280]">{hint}</p>}
      {children}
    </div>
  )
}

export default FormField
