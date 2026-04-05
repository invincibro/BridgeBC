const AVAILABILITY_SLOTS = [
  "weekday_morning",
  "weekday_afternoon",
  "weekday_evening",
  "weekend_morning",
  "weekend_afternoon",
  "weekend_evening",
];

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function humanizeAvailabilitySlot(slot) {
  return String(slot)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAvailabilitySlots(record) {
  return AVAILABILITY_SLOTS.filter((slot) => Boolean(record[slot]));
}

function getMatchingDetails(volunteer, job) {
  const volunteerLanguages = normalizeList(volunteer.languages_spoken);
  const volunteerSkills = normalizeList(volunteer.skills);
  const volunteerInterests = normalizeList(volunteer.cause_areas_of_interest);
  const jobLanguages = normalizeList(job.languages_needed);
  const jobSkills = normalizeList(job.skills_needed);

  const orgSlots = getAvailabilitySlots(job);
  const volunteerSlots = getAvailabilitySlots(volunteer);

  const matchingLanguages = jobLanguages.filter((language) =>
    volunteerLanguages.includes(language)
  );
  const matchingSkills = jobSkills.filter((skill) =>
    volunteerSkills.includes(skill)
  );
  const matchingAvailability = orgSlots.filter((slot) =>
    volunteerSlots.includes(slot)
  );
  const matchingInterest = volunteerInterests.find(
    (interest) => interest === job.sector
  );

  return {
    matchingLanguages,
    matchingSkills,
    matchingAvailability,
    matchingInterest,
    orgSlots,
  };
}

/**
 * Scores how well a volunteer fits an organization's needs.
 *
 * @param {object} volunteer - Row from the volunteers table
 * @param {object} job       - Row from the organizations table
 * @returns {number}         - Fitness score between 0 and 1
 */
function scoreJob(volunteer, job) {
  const scores = [];
  const {
    matchingLanguages,
    matchingSkills,
    matchingAvailability,
    matchingInterest,
    orgSlots,
  } = getMatchingDetails(volunteer, job);

  // --- Language match ---
  // Does the volunteer speak at least one language the org needs?
  const langMatch =
    normalizeList(job.languages_needed).length === 0
      ? 1
      : matchingLanguages.length / normalizeList(job.languages_needed).length;
  scores.push({ weight: 2, value: langMatch });

  // --- Skills match ---
  // What fraction of the org's needed skills does the volunteer have?
  const skillMatch =
    normalizeList(job.skills_needed).length === 0
      ? 1
      : matchingSkills.length / normalizeList(job.skills_needed).length;
  scores.push({ weight: 3, value: skillMatch });

  // --- Cause area match ---
  // Does the volunteer care about this org's sector?
  const causeMatch = matchingInterest ? 1 : 0;
  scores.push({ weight: 2, value: causeMatch });

  // --- Availability match ---
  // How many of the org's available slots overlap with the volunteer's?
  const availMatch =
    orgSlots.length === 0
      ? 1
      : matchingAvailability.length / orgSlots.length;
  scores.push({ weight: 2, value: availMatch });

  // --- Background check ---
  // If the org requires it, the volunteer must have completed it
  const bgMatch = job.background_check_required
    ? volunteer.background_check_status === "Completed"
      ? 1
      : 0
    : 1;
  scores.push({ weight: 1, value: bgMatch });

  // --- Weighted average ---
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const totalScore = scores.reduce((sum, s) => sum + s.value * s.weight, 0);

  return parseFloat((totalScore / totalWeight).toFixed(4));
}

function explainJobFit(volunteer, job) {
  const {
    matchingLanguages,
    matchingSkills,
    matchingAvailability,
    matchingInterest,
    orgSlots,
  } = getMatchingDetails(volunteer, job);
  const reasons = [];

  if (matchingAvailability.length > 0) {
    const slot = humanizeAvailabilitySlot(matchingAvailability[0]);
    reasons.push(`Matches your ${slot.toLowerCase()} availability`);
  }

  if (matchingLanguages.length > 0) {
    reasons.push(`Uses your ${matchingLanguages[0]} language`);
  }

  if (matchingSkills.length > 0) {
    reasons.push(`Fits your ${matchingSkills[0].toLowerCase()} experience`);
  }

  if (matchingInterest) {
    reasons.push(`Aligns with your interest in ${matchingInterest.toLowerCase()}`);
  }

  if (
    job.background_check_required &&
    volunteer.background_check_status === "Completed"
  ) {
    reasons.push("Meets the background check requirement");
  }

  if (reasons.length === 0 && orgSlots.length > 0) {
    reasons.push("Could still be a fit if your schedule is flexible");
  }

  if (reasons.length === 0) {
    reasons.push("Your profile overlaps with this organization's current need");
  }

  return reasons.slice(0, 3);
}

module.exports = { scoreJob, explainJobFit };
