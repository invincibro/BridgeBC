function toComparableString(value) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeMultiValueField(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => toComparableString(item)).filter(Boolean))]
  }

  if (typeof value === 'string') {
    return [
      ...new Set(
        value
          .split(/[;,]/)
          .map((item) => toComparableString(item))
          .filter(Boolean),
      ),
    ]
  }

  return []
}

export function computeArrayOverlapScore(a, b) {
  const left = normalizeMultiValueField(a)
  const right = normalizeMultiValueField(b)

  if (!left.length || !right.length) {
    return 0
  }

  const leftSet = new Set(left)
  const rightSet = new Set(right)
  const intersection = [...leftSet].filter((item) => rightSet.has(item))
  const union = new Set([...leftSet, ...rightSet])

  return union.size ? intersection.length / union.size : 0
}

function parseAvailabilityToken(token) {
  const normalized = toComparableString(token)

  return {
    raw: normalized,
    weekday: normalized.includes('weekday'),
    weekend: normalized.includes('weekend'),
    morning: normalized.includes('morning'),
    afternoon: normalized.includes('afternoon'),
    evening: normalized.includes('evening'),
    flexible: normalized.includes('flexible'),
  }
}

export function computeAvailabilitySimilarity(a, b) {
  const left = normalizeMultiValueField(a)
  const right = normalizeMultiValueField(b)

  if (!left.length || !right.length) {
    return 0
  }

  const leftSet = new Set(left)
  const exactOverlap = right.some((item) => leftSet.has(item))
  if (exactOverlap) {
    return 1
  }

  const leftParsed = left.map(parseAvailabilityToken)
  const rightParsed = right.map(parseAvailabilityToken)

  const similarOverlap = leftParsed.some((leftToken) =>
    rightParsed.some((rightToken) => {
      if (leftToken.flexible || rightToken.flexible) {
        return true
      }

      const sameDayGroup =
        (leftToken.weekday && rightToken.weekday) || (leftToken.weekend && rightToken.weekend)
      const sameTimeGroup =
        (leftToken.morning && rightToken.morning) ||
        (leftToken.afternoon && rightToken.afternoon) ||
        (leftToken.evening && rightToken.evening)

      return sameDayGroup || sameTimeGroup
    }),
  )

  return similarOverlap ? 0.6 : 0
}

export function computeNumericCloseness(a, b, maxRange) {
  const left = Number(a)
  const right = Number(b)
  const range = Number(maxRange)

  if (!Number.isFinite(left) || !Number.isFinite(right) || !Number.isFinite(range) || range <= 0) {
    return 0
  }

  return Math.max(0, 1 - Math.abs(left - right) / range)
}

export function computeBooleanMatch(a, b) {
  if (typeof a !== 'boolean' || typeof b !== 'boolean') {
    return 0
  }

  return a === b ? 1 : 0
}

function normalizeExperience(value) {
  const normalized = toComparableString(value)

  if (!normalized) {
    return 0
  }

  if (
    normalized.includes('extensive') ||
    normalized.includes('experienced') ||
    normalized.includes('3+')
  ) {
    return 3
  }

  if (normalized.includes('moderate')) {
    return 2
  }

  if (normalized.includes('some') || normalized.includes('1-2')) {
    return 1
  }

  return 0
}

function computeExperienceSimilarity(a, b) {
  const left = normalizeExperience(a)
  const right = normalizeExperience(b)

  if (left === 0 && right === 0) {
    return 1
  }

  return Math.max(0, 1 - Math.abs(left - right) / 3)
}

function computeBackgroundStatusSimilarity(a, b) {
  const left = toComparableString(a)
  const right = toComparableString(b)

  if (!left || !right) {
    return 0
  }

  return left === right ? 1 : 0
}

function titleCase(value) {
  return String(value || '').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSharedNonEnglishLanguages(firstVolunteer, secondVolunteer) {
  const first = normalizeMultiValueField(firstVolunteer.languages_spoken).filter(
    (language) => language !== 'english',
  )
  const second = normalizeMultiValueField(secondVolunteer.languages_spoken).filter(
    (language) => language !== 'english',
  )

  const secondSet = new Set(second)
  return first.filter((language) => secondSet.has(language))
}

function collectCommonFactors(firstVolunteer, secondVolunteer, detailScores) {
  const factors = []
  const firstCauses = normalizeMultiValueField(firstVolunteer.cause_areas_of_interest)
  const secondCauses = normalizeMultiValueField(secondVolunteer.cause_areas_of_interest)
  const firstSkills = normalizeMultiValueField(firstVolunteer.skills)
  const secondSkills = normalizeMultiValueField(secondVolunteer.skills)
  const sharedCauses = firstCauses.filter((cause) => secondCauses.includes(cause))
  const sharedSkills = firstSkills.filter((skill) => secondSkills.includes(skill))
  const sharedLanguages = getSharedNonEnglishLanguages(firstVolunteer, secondVolunteer)
  const leftAvailability = normalizeMultiValueField(firstVolunteer.availability)
  const rightAvailability = normalizeMultiValueField(secondVolunteer.availability)
  const sharedAvailability = leftAvailability.find((slot) => rightAvailability.includes(slot))
  const firstNeighbourhood = toComparableString(firstVolunteer.neighbourhood)
  const secondNeighbourhood = toComparableString(secondVolunteer.neighbourhood)

  if (sharedCauses[0]) {
    factors.push({
      weight: detailScores.causeAreas,
      label: `Shared cause: ${titleCase(sharedCauses[0])}`,
    })
  }

  if (sharedSkills[0]) {
    factors.push({
      weight: detailScores.skills,
      label: `Shared skill: ${titleCase(sharedSkills[0])}`,
    })
  }

  if (sharedAvailability) {
    factors.push({
      weight: detailScores.availability,
      label: `Similar availability: ${titleCase(sharedAvailability)}`,
    })
  } else if (detailScores.availability >= 0.6) {
    factors.push({
      weight: detailScores.availability,
      label: 'Similar availability',
    })
  }

  if (sharedLanguages[0]) {
    factors.push({
      weight: detailScores.languages,
      label: `Shared language: ${titleCase(sharedLanguages[0])}`,
    })
  }

  if (firstNeighbourhood && firstNeighbourhood === secondNeighbourhood) {
    factors.push({
      weight: detailScores.neighbourhood,
      label: `Same neighbourhood: ${titleCase(firstNeighbourhood)}`,
    })
  }

  if (
    factors.length < 4 &&
    detailScores.hours >= 0.85 &&
    Number.isFinite(Number(firstVolunteer.hours_available_per_month)) &&
    Number.isFinite(Number(secondVolunteer.hours_available_per_month))
  ) {
    factors.push({
      weight: detailScores.hours,
      label: 'Similar time available each month',
    })
  }

  return factors
    .sort((first, second) => second.weight - first.weight)
    .slice(0, 4)
    .map((factor) => factor.label)
}

export function computeVolunteerSimilarity(currentVolunteer, otherVolunteer) {
  const sharedNonEnglishLanguages = getSharedNonEnglishLanguages(currentVolunteer, otherVolunteer)
  const languageScore = sharedNonEnglishLanguages.length
    ? computeArrayOverlapScore(
        normalizeMultiValueField(currentVolunteer.languages_spoken).filter(
          (language) => language !== 'english',
        ),
        normalizeMultiValueField(otherVolunteer.languages_spoken).filter(
          (language) => language !== 'english',
        ),
      )
    : 0

  const detailScores = {
    causeAreas: computeArrayOverlapScore(
      currentVolunteer.cause_areas_of_interest,
      otherVolunteer.cause_areas_of_interest,
    ),
    skills: computeArrayOverlapScore(currentVolunteer.skills, otherVolunteer.skills),
    availability: computeAvailabilitySimilarity(
      currentVolunteer.availability,
      otherVolunteer.availability,
    ),
    languages: languageScore,
    neighbourhood:
      toComparableString(currentVolunteer.neighbourhood) &&
      toComparableString(currentVolunteer.neighbourhood) ===
        toComparableString(otherVolunteer.neighbourhood)
        ? 1
        : 0,
    hours: computeNumericCloseness(
      currentVolunteer.hours_available_per_month,
      otherVolunteer.hours_available_per_month,
      40,
    ),
    experience: computeExperienceSimilarity(
      currentVolunteer.prior_volunteer_experience || currentVolunteer.experience_level,
      otherVolunteer.prior_volunteer_experience || otherVolunteer.experience_level,
    ),
    backgroundCheck: computeBackgroundStatusSimilarity(
      currentVolunteer.background_check_status,
      otherVolunteer.background_check_status,
    ),
    vehicle: computeBooleanMatch(currentVolunteer.has_vehicle, otherVolunteer.has_vehicle),
  }

  const similarityScore =
    0.28 * detailScores.causeAreas +
    0.22 * detailScores.skills +
    0.18 * detailScores.availability +
    0.12 * detailScores.languages +
    0.1 * detailScores.neighbourhood +
    0.05 * detailScores.hours +
    0.03 * detailScores.experience +
    0.01 * detailScores.backgroundCheck +
    0.01 * detailScores.vehicle

  return {
    volunteer: otherVolunteer,
    similarityScore: Number(similarityScore.toFixed(2)),
    commonFactors: collectCommonFactors(currentVolunteer, otherVolunteer, detailScores),
  }
}

export function findTopSimilarVolunteers(currentVolunteer, volunteers, limit = 3) {
  const currentId = currentVolunteer?.volunteer_id || currentVolunteer?.id

  return (volunteers || [])
    .filter((volunteer) => (volunteer?.volunteer_id || volunteer?.id) !== currentId)
    .map((volunteer) => computeVolunteerSimilarity(currentVolunteer, volunteer))
    .sort((first, second) => second.similarityScore - first.similarityScore)
    .slice(0, limit)
}
