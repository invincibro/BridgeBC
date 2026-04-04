/**
 * Scores how well a volunteer fits an organization's needs.
 *
 * @param {object} volunteer - Row from the volunteers table
 * @param {object} job       - Row from the organizations table
 * @returns {number}         - Fitness score between 0 and 1
 */
function scoreJob(volunteer, job) {
  const scores = [];

  // --- Language match ---
  // Does the volunteer speak at least one language the org needs?
  const langMatch =
    job.languages_needed.length === 0
      ? 1
      : job.languages_needed.filter((l) =>
          volunteer.languages_spoken.includes(l)
        ).length / job.languages_needed.length;
  scores.push({ weight: 2, value: langMatch });

  // --- Skills match ---
  // What fraction of the org's needed skills does the volunteer have?
  const skillMatch =
    job.skills_needed.length === 0
      ? 1
      : job.skills_needed.filter((s) =>
          volunteer.skills.includes(s)
        ).length / job.skills_needed.length;
  scores.push({ weight: 3, value: skillMatch });

  // --- Cause area match ---
  // Does the volunteer care about this org's sector?
  const causeMatch = volunteer.cause_areas_of_interest.includes(job.sector)
    ? 1
    : 0;
  scores.push({ weight: 2, value: causeMatch });

  // --- Availability match ---
  // How many of the org's available slots overlap with the volunteer's?
  const availSlots = [
    "weekday_morning",
    "weekday_afternoon",
    "weekday_evening",
    "weekend_morning",
    "weekend_afternoon",
    "weekend_evening",
  ];
  const orgSlots = availSlots.filter((s) => job[s]);
  const availMatch =
    orgSlots.length === 0
      ? 1
      : orgSlots.filter((s) => volunteer[s]).length / orgSlots.length;
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

module.exports = { scoreJob };