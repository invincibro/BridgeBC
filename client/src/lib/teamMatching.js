import { normalizeMultiValueField } from './volunteerSimilarity.js'

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))]
}

export function combineTeamFields(teamMembers, fieldName) {
  return uniqueValues(
    (teamMembers || []).flatMap((member) => normalizeMultiValueField(member?.[fieldName])),
  )
}

function getNonEnglishLanguages(values) {
  return normalizeMultiValueField(values).filter((language) => language !== 'english')
}

export function computeCoverageScore(teamValues, orgValues) {
  const teamSet = new Set(normalizeMultiValueField(teamValues))
  const orgSet = uniqueValues(normalizeMultiValueField(orgValues))

  if (!orgSet.length) {
    return 1
  }

  const matches = orgSet.filter((value) => teamSet.has(value)).length
  return matches / orgSet.length
}

function parseAvailabilityString(value) {
  const tokens = normalizeMultiValueField(value)

  return {
    raw: tokens,
    weekday: tokens.some((token) => token.includes('weekday')),
    weekend: tokens.some((token) => token.includes('weekend')),
    morning: tokens.some((token) => token.includes('morning')),
    afternoon: tokens.some((token) => token.includes('afternoon')),
    evening: tokens.some((token) => token.includes('evening')),
    flexible: tokens.some((token) => token.includes('flexible')),
  }
}

export function computeAvailabilityCoverage(teamMembers, orgAvailability) {
  const org = parseAvailabilityString(orgAvailability)

  if (!org.raw.length) {
    return 1
  }

  const teamHasExact = (teamMembers || []).some((member) =>
    normalizeMultiValueField(member?.availability).some((slot) => org.raw.includes(slot)),
  )

  if (teamHasExact) {
    return 1
  }

  const partialMatch = (teamMembers || []).some((member) => {
    const availability = parseAvailabilityString(member?.availability)

    if (availability.flexible || org.flexible) {
      return true
    }

    const dayMatch = (availability.weekday && org.weekday) || (availability.weekend && org.weekend)
    const timeMatch =
      (availability.morning && org.morning) ||
      (availability.afternoon && org.afternoon) ||
      (availability.evening && org.evening)

    return dayMatch || timeMatch
  })

  return partialMatch ? 0.65 : 0
}

export function computeBackgroundCoverage(teamMembers, orgRequirement) {
  if (!orgRequirement) {
    return 1
  }

  const team = teamMembers || []
  if (!team.length) {
    return 0
  }

  const completedCount = team.filter(
    (member) => String(member?.background_check_status || '').toLowerCase() === 'completed',
  ).length

  return completedCount / team.length
}

function titleCase(value) {
  return String(value || '').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSharedCoverage(teamValues, orgValues) {
  const teamSet = new Set(normalizeMultiValueField(teamValues))
  return uniqueValues(normalizeMultiValueField(orgValues)).filter((value) => teamSet.has(value))
}

export function generateTeamReasons(teamMembers, org) {
  const reasons = []
  const combinedSkills = combineTeamFields(teamMembers, 'skills')
  const combinedCauses = uniqueValues(
    (teamMembers || []).flatMap((member) =>
      normalizeMultiValueField(member?.cause_areas_of_interest || member?.interests),
    ),
  )
  const combinedLanguages = uniqueValues(
    (teamMembers || []).flatMap((member) => getNonEnglishLanguages(member?.languages_spoken)),
  )

  const coveredSkills = getSharedCoverage(combinedSkills, org?.skills_needed)
  if (coveredSkills.length > 0) {
    reasons.push(`Together they cover ${coveredSkills.slice(0, 2).join(' and ').toLowerCase()}`)
  }

  const availabilityCoverage = computeAvailabilityCoverage(teamMembers, org?.availability_preference)
  if (availabilityCoverage >= 1) {
    reasons.push(`This team matches ${String(org?.availability_preference || 'the needed')} availability`)
  } else if (availabilityCoverage >= 0.65) {
    reasons.push('This team improves availability coverage')
  }

  const sharedLanguages = getSharedCoverage(combinedLanguages, getNonEnglishLanguages(org?.languages_needed))
  if (sharedLanguages.length > 0) {
    reasons.push(`Shared ${titleCase(sharedLanguages[0])} support improves language coverage`)
  }

  const coveredCauses = getSharedCoverage(combinedCauses, org?.sector)
  if (coveredCauses.length > 0) {
    reasons.push(`Strong alignment with ${coveredCauses[0].toLowerCase()}`)
  } else if (normalizeMultiValueField(org?.sector).length > 0) {
    const sector = normalizeMultiValueField(org?.sector)[0]
    if (combinedCauses.includes(sector)) {
      reasons.push(`Strong alignment with ${sector.toLowerCase()}`)
    }
  }

  const backgroundCoverage = computeBackgroundCoverage(teamMembers, org?.background_check_required)
  if (backgroundCoverage === 1 && org?.background_check_required) {
    reasons.push('All suggested members meet screening requirements')
  }

  if (reasons.length === 0) {
    reasons.push('This team covers more of the organization’s needs than one volunteer alone.')
  }

  return reasons.slice(0, 4)
}

function chooseBestTeam(currentVolunteer, candidatePool, organization) {
  const candidates = (candidatePool || []).map((item) => item.volunteer || item).filter(Boolean)
  const combinations = []

  candidates.forEach((candidate, index) => {
    combinations.push([currentVolunteer, candidate])

    for (let innerIndex = index + 1; innerIndex < candidates.length; innerIndex += 1) {
      combinations.push([currentVolunteer, candidate, candidates[innerIndex]])
    }
  })

  if (!combinations.length) {
    combinations.push([currentVolunteer])
  }

  return combinations
    .map((teamMembers) => {
      const combinedSkills = combineTeamFields(teamMembers, 'skills')
      const combinedCauses = uniqueValues(
        teamMembers.flatMap((member) =>
          normalizeMultiValueField(member?.cause_areas_of_interest || member?.interests),
        ),
      )
      const combinedLanguages = uniqueValues(
        teamMembers.flatMap((member) => getNonEnglishLanguages(member?.languages_spoken)),
      )

      const teamFitScore = Number(
        (
          0.35 * computeCoverageScore(combinedSkills, organization?.skills_needed) +
          0.2 * computeCoverageScore(combinedCauses, organization?.sector) +
          0.2 * computeAvailabilityCoverage(teamMembers, organization?.availability_preference) +
          0.15 * computeCoverageScore(combinedLanguages, getNonEnglishLanguages(organization?.languages_needed)) +
          0.1 * computeBackgroundCoverage(teamMembers, organization?.background_check_required)
        ).toFixed(2),
      )

      return {
        bestTeamMembers: teamMembers,
        teamFitScore,
        teamReasons: generateTeamReasons(teamMembers, organization),
      }
    })
    .sort((first, second) => second.teamFitScore - first.teamFitScore)[0]
}

export function getTeamFitLabel(score) {
  if (score >= 0.85) return 'Strong team match'
  return 'Good team coverage'
}

export function recommendVolunteerTeam(
  currentVolunteer,
  featuredOrganization,
  allVolunteers,
  similarVolunteers,
) {
  if (!currentVolunteer || !featuredOrganization) {
    return null
  }

  const candidatePool =
    (similarVolunteers && similarVolunteers.length > 0 ? similarVolunteers : allVolunteers || []).slice(0, 3)

  return chooseBestTeam(currentVolunteer, candidatePool, featuredOrganization)
}
