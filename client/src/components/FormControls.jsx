export function TextInput({ id, value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="warm-input"
    />
  )
}

export function TextArea({ id, value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="warm-input"
    />
  )
}

export function SelectInput({ id, value, onChange, options }) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="warm-input"
    >
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  )
}

export function TogglePillGroup({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={active ? 'pill-button-active' : 'pill-button'}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
