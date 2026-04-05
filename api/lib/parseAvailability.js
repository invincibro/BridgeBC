function parseAvailability(availability) {
  const val = (availability || "").toLowerCase().trim();

  const result = {
    weekday_morning: false,
    weekday_afternoon: false,
    weekday_evening: false,
    weekend_morning: false,
    weekend_afternoon: false,
    weekend_evening: false,
  };

  if (!val) return result;

  if (val.includes("flexible")) {
    return Object.fromEntries(Object.keys(result).map((k) => [k, true]));
  }

  const isWeekday   = val.includes("weekday") || val.includes("weekdays");
  const isWeekend   = val.includes("weekend") || val.includes("weekends");
  const isMorning   = val.includes("morning");
  const isAfternoon = val.includes("afternoon");
  const isEvening   = val.includes("evening");
  const isOnly      = !isMorning && !isAfternoon && !isEvening;

  if (isWeekday && isOnly) {
    result.weekday_morning = result.weekday_afternoon = result.weekday_evening = true;
  } else if (isWeekend && isOnly) {
    result.weekend_morning = result.weekend_afternoon = result.weekend_evening = true;
  } else if (isEvening && !isWeekday && !isWeekend) {
    result.weekday_evening = result.weekend_evening = true;
  } else {
    if (isWeekday && isMorning)   result.weekday_morning   = true;
    if (isWeekday && isAfternoon) result.weekday_afternoon = true;
    if (isWeekday && isEvening)   result.weekday_evening   = true;
    if (isWeekend && isMorning)   result.weekend_morning   = true;
    if (isWeekend && isAfternoon) result.weekend_afternoon = true;
    if (isWeekend && isEvening)   result.weekend_evening   = true;
  }

  return result;
}

module.exports = { parseAvailability };