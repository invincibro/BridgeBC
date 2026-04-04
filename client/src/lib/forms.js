export function toggleListValue(currentValues, option) {
  return currentValues.includes(option)
    ? currentValues.filter((item) => item !== option)
    : [...currentValues, option]
}
