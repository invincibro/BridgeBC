const { scoreJob } = require("../scorer/scoreJob");
const assert = require("node:assert/strict");

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseVolunteer = {
  languages_spoken: ["English", "Mandarin"],
  skills: ["Tutoring/mentorship", "Event coordination"],
  cause_areas_of_interest: ["Youth services"],
  background_check_status: "Completed",
  weekday_morning: true,
  weekday_afternoon: false,
  weekday_evening: false,
  weekend_morning: false,
  weekend_afternoon: false,
  weekend_evening: false,
};

const baseJob = {
  languages_needed: ["English", "Mandarin"],
  skills_needed: ["Tutoring/mentorship", "Event coordination"],
  sector: "Youth services",
  background_check_required: true,
  weekday_morning: true,
  weekday_afternoon: false,
  weekday_evening: false,
  weekend_morning: false,
  weekend_afternoon: false,
  weekend_evening: false,
};

// Helper — clone and override fields
const vol = (overrides) => ({ ...baseVolunteer, ...overrides });
const job = (overrides) => ({ ...baseJob, ...overrides });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("\nscoreJob()\n");

// --- Perfect match ---
console.log("  perfect match");
test("returns 1 when everything matches", () => {
  assert.equal(scoreJob(baseVolunteer, baseJob), 1);
});

// --- Language ---
console.log("\n  language");
test("full score when job has no language requirements", () => {
  assert.equal(scoreJob(baseVolunteer, job({ languages_needed: [] })), 1);
});

test("partial score for partial language match", () => {
  const score = scoreJob(
    vol({ languages_spoken: ["English"] }),
    job({ languages_needed: ["English", "Mandarin"] })
  );
  assert.ok(score > 0 && score < 1, `expected between 0 and 1, got ${score}`);
});

test("zero language contribution when no languages match", () => {
  const noLangScore = scoreJob(
    vol({ languages_spoken: ["French"] }),
    job({ languages_needed: ["Mandarin"] })
  );
  const fullScore = scoreJob(baseVolunteer, baseJob);
  assert.ok(noLangScore < fullScore);
});

// --- Skills ---
console.log("\n  skills");
test("full score when job has no skill requirements", () => {
  assert.equal(scoreJob(baseVolunteer, job({ skills_needed: [] })), 1);
});

test("partial score for partial skill match", () => {
  const score = scoreJob(
    vol({ skills: ["Tutoring/mentorship"] }),
    job({ skills_needed: ["Tutoring/mentorship", "Event coordination"] })
  );
  assert.ok(score > 0 && score < 1, `expected between 0 and 1, got ${score}`);
});

test("zero skill contribution when no skills match", () => {
  const noSkillScore = scoreJob(
    vol({ skills: ["Cooking/food prep"] }),
    job({ skills_needed: ["Tutoring/mentorship", "Event coordination"] })
  );
  const fullScore = scoreJob(baseVolunteer, baseJob);
  assert.ok(noSkillScore < fullScore);
});

test("skills contribute more than other signals (highest weight)", () => {
  const noSkill = scoreJob(
    vol({ skills: [] }),
    job({ skills_needed: ["Tutoring/mentorship"] })
  );
  const noLang = scoreJob(
    vol({ languages_spoken: [] }),
    job({ languages_needed: ["English"] })
  );
  assert.ok(noSkill < noLang, "missing skills should hurt more than missing languages");
});

// --- Cause area ---
console.log("\n  cause area");
test("lower score when volunteer cause doesn't match sector", () => {
  const score = scoreJob(
    vol({ cause_areas_of_interest: ["Mental health"] }),
    baseJob
  );
  assert.ok(score < 1);
});

test("full cause score when sector matches", () => {
  assert.equal(
    scoreJob(
      vol({ cause_areas_of_interest: ["Youth services", "Mental health"] }),
      baseJob
    ),
    1
  );
});

// --- Availability ---
console.log("\n  availability");
test("full score when job has no availability slots set", () => {
  assert.equal(
    scoreJob(
      baseVolunteer,
      job({
        weekday_morning: false,
        weekday_afternoon: false,
        weekday_evening: false,
        weekend_morning: false,
        weekend_afternoon: false,
        weekend_evening: false,
      })
    ),
    1
  );
});

test("partial score for partial availability overlap", () => {
  const score = scoreJob(
    vol({
      weekday_morning: true,
      weekday_afternoon: false,
      weekday_evening: false,
      weekend_morning: false,
      weekend_afternoon: false,
      weekend_evening: false,
    }),
    job({
      weekday_morning: true,
      weekday_afternoon: true,
      weekday_evening: false,
      weekend_morning: false,
      weekend_afternoon: false,
      weekend_evening: false,
    })
  );
  assert.ok(score > 0 && score < 1, `expected between 0 and 1, got ${score}`);
});

test("zero availability contribution when no slots overlap", () => {
  const score = scoreJob(
    vol({
      weekday_morning: false,
      weekday_afternoon: false,
      weekday_evening: false,
      weekend_morning: true,
      weekend_afternoon: true,
      weekend_evening: true,
    }),
    job({
      weekday_morning: true,
      weekday_afternoon: true,
      weekday_evening: true,
      weekend_morning: false,
      weekend_afternoon: false,
      weekend_evening: false,
    })
  );
  assert.ok(score < 1);
});

// --- Background check ---
console.log("\n  background check");
test("no penalty when org doesn't require background check", () => {
  const score = scoreJob(
    vol({ background_check_status: "Not yet" }),
    job({ background_check_required: false })
  );
  assert.equal(score, 1);
});

test("lower score when check required but not completed", () => {
  const score = scoreJob(
    vol({ background_check_status: "Not yet" }),
    job({ background_check_required: true })
  );
  assert.ok(score < 1);
});

test("full bg score when check required and completed", () => {
  assert.equal(
    scoreJob(
      vol({ background_check_status: "Completed" }),
      job({ background_check_required: true })
    ),
    1
  );
});

// --- Output range ---
console.log("\n  output range");
test("score is always between 0 and 1 for a worst-case volunteer", () => {
  const score = scoreJob(
    vol({
      languages_spoken: [],
      skills: [],
      cause_areas_of_interest: [],
      background_check_status: "Not yet",
      weekday_morning: false,
      weekday_afternoon: false,
      weekday_evening: false,
      weekend_morning: false,
      weekend_afternoon: false,
      weekend_evening: false,
    }),
    baseJob
  );
  assert.ok(score >= 0 && score <= 1, `expected 0-1, got ${score}`);
});

test("score is a number with at most 4 decimal places", () => {
  const score = scoreJob(
    vol({ languages_spoken: ["English"] }),
    job({ languages_needed: ["English", "Mandarin", "French"] })
  );
  assert.match(String(score), /^\d+(\.\d{1,4})?$/);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);