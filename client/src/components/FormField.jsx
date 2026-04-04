function FormField({ label, htmlFor, required = false, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
      </label>
      {hint && <p className="mb-2 text-sm text-slate-500">{hint}</p>}
      {children}
    </div>
  )
}

export default FormField
