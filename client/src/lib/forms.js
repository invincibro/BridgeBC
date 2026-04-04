export function toggleListValue(values, value) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
}
