const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { explainJobFit, scoreJob } = require("./lib/scoreJob");
const { recommendVolunteerTeam } = require("./lib/teamMatching");
const { findTopSimilarVolunteers } = require("./lib/volunteerSimilarity");
const { parseAvailability } = require("./lib/parseAvailability")

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// --- Health ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

function normalizeOrganization(row) {
  return {
    ...row,
    BN: row.bn,
    org_name: row.account_name || row.legal_name,
  };
}


function availabilityBooleansToList(row) {
  const result = [];

  if (row.weekday_morning) result.push("Weekday mornings");
  if (row.weekday_afternoon) result.push("Weekday afternoons");
  if (row.weekday_evening) result.push("Weekday evenings");
  if (row.weekend_morning) result.push("Weekend mornings");
  if (row.weekend_afternoon) result.push("Weekend afternoons");
  if (row.weekend_evening) result.push("Weekend evenings");

  return result;
}
function normalizeVolunteer(row) {
  const availability = availabilityBooleansToList(row)

  return {
    ...row, availability: availability
  };
}

function mapVolunteerExperience(value) {
  const options = {
    None: "None",
    Some: "Some (1-2 orgs)",
    Moderate: "Experienced (3+ orgs)",
    Extensive: "Experienced (3+ orgs)",
  };

  return options[value] || "None";
}

function mapBackgroundStatus(value) {
  const options = {
    Pending: "Not yet",
    "In Progress": "In progress",
    Completed: "Completed",
    "Not yet": "Not yet",
    "In progress": "In progress",
  };

  return options[value] || "Not yet";
}

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express!", env: process.env.NODE_ENV });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

// --- Volunteers ---
app.get("/api/volunteers", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM volunteers ORDER BY volunteer_id");
    res.json(rows.map(normalizeVolunteer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.get("/api/volunteers/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM volunteers WHERE volunteer_id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Volunteer not found" });

    res.json(normalizeVolunteer(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/volunteers", async (req, res) => {
  const {
    first_name,
    last_name,
    age,
    neighbourhood,
    languages_spoken,
    skills,
    cause_areas_of_interest,
    availability,
    hours_available_per_month,
    prior_volunteer_experience,
    has_vehicle,
    background_check_status,
    weekday_morning,
    weekday_afternoon,
    weekday_evening,
    weekend_morning,
    weekend_afternoon,
    weekend_evening,
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "first_name and last_name are required." });
  }

  try {
    const nextIdResult = await pool.query(`
      SELECT COALESCE(MAX(id),0)+1 AS next_number
      FROM volunteers
    `);

    const volunteerCode = `VOL-${String(nextIdResult.rows[0].next_number).padStart(3, "0")}`;

    const { rows } = await pool.query(
      `INSERT INTO volunteers (
        volunteer_id,
        first_name,
        last_name,
        neighbourhood,
        languages_spoken,
        skills,
        cause_areas_of_interest,
        hours_available_per_month,
        prior_volunteer_experience,
        has_vehicle,
        background_check_status,
        weekday_morning,
        weekday_afternoon,
        weekday_evening,
        weekend_morning,
        weekend_afternoon,
        weekend_evening
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17
      )
      RETURNING *`,
      [
        volunteerCode,
        first_name,
        last_name,
        age || null,
        neighbourhood || null,
        languages_spoken || [],
        skills || [],
        cause_areas_of_interest || [],
        Array.isArray(availability) ? availability.join("; ") : availability || null,
        Number(hours_available_per_month || 0),
        mapVolunteerExperience(prior_volunteer_experience),
        Boolean(has_vehicle),
        mapBackgroundStatus(background_check_status),
        Boolean(weekday_morning),
        Boolean(weekday_afternoon),
        Boolean(weekday_evening),
        Boolean(weekend_morning),
        Boolean(weekend_afternoon),
        Boolean(weekend_evening),
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- Organizations ---
app.get("/api/organizations/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM organizations WHERE id = $1", [req.params.id]);
    res.json(rows.map(normalizeOrganization));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/organizations", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM organizations ORDER BY legal_name");
    res.json(rows.map(normalizeOrganization));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/organizations", async (req, res) => {
  const {
    BN,
    legal_name,
    account_name,
    address1,
    address2,
    city,
    province,
    postal_code,
    country,
    sector,
    org_size,
    volunteers_currently_needed,
    volunteer_urgency,
    skills_needed,
    languages_needed,
    availability_preference,
    background_check_required,
    weekday_morning,
    weekday_afternoon,
    weekday_evening,
    weekend_morning,
    weekend_afternoon,
    weekend_evening,
  } = req.body;

  if (!BN || !legal_name) {
    return res.status(400).json({ message: "BN and legal_name are required." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO organizations (
        bn, legal_name, account_name, address1, address2, city,
        province, postal_code, country, sector, org_size,
        volunteers_currently_needed, volunteer_urgency, skills_needed, languages_needed,
        availability_preference, background_check_required,
        weekday_morning, weekday_afternoon, weekday_evening,
        weekend_morning, weekend_afternoon, weekend_evening
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
      RETURNING *`,
      [
        BN,
        legal_name,
        account_name || null,
        address1 || null,
        address2 || null,
        city || null,
        province || null,
        postal_code || null,
        country || null,
        sector || null,
        org_size || null,
        Number(volunteers_currently_needed || 1),
        volunteer_urgency || null,
        skills_needed || [],
        languages_needed || [],
        availability_preference || deriveAvailabilityPreferenceFromSlots(req.body),
        Boolean(background_check_required),
        Boolean(weekday_morning),
        Boolean(weekday_afternoon),
        Boolean(weekday_evening),
        Boolean(weekend_morning),
        Boolean(weekend_afternoon),
        Boolean(weekend_evening),
      ]
    );

    return res.status(201).json(normalizeOrganization(rows[0]));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// --- Recommended organizations for a volunteer ---
app.get("/api/volunteers/:id/recommended-organizations", async (req, res) => {
  const threshold = 0.5
  try {
    const { rows: volunteers } = await pool.query(
      "SELECT * FROM volunteers WHERE volunteer_id = $1",
      [req.params.id]
    );
    if (volunteers.length === 0) return res.status(404).json({ message: "Volunteer not found" });

    const volunteer = volunteers[0];
    const { rows: organizations } = await pool.query("SELECT * FROM organizations");

    const ranked = organizations
      .map((org) => ({
        ...org,
        score: scoreJob(volunteer, org),
        match_reasons: explainJobFit(volunteer, org),
      })).filter((org) => (org.score >= threshold))
      .sort((a, b) => b.score - a.score);

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Recomendation fot similar volunteers
app.get("/api/volunteers/:id/similar-volunteers", async (req, res) => {
  try {
    const { rows: volunteerRows } = await pool.query(
      "SELECT * FROM volunteers ORDER BY volunteer_id"
    );

    const volunteers = volunteerRows.map(normalizeVolunteer);
    const currentVolunteer = volunteers.find(
      (volunteer) => volunteer.volunteer_id === req.params.id
    );

    if (!currentVolunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    return res.json(findTopSimilarVolunteers(currentVolunteer, volunteers, 3));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Recomendation fot suggested teams
app.get("/api/volunteers/:id/suggested-team", async (req, res) => {
  try {
    const { rows: volunteerRows } = await pool.query(
      "SELECT * FROM volunteers ORDER BY volunteer_id"
    );
    const volunteers = volunteerRows.map(normalizeVolunteer);
    const currentVolunteer = volunteers.find(
      (volunteer) => volunteer.volunteer_id === req.params.id
    );

    if (!currentVolunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    const { rows: organizations } = await pool.query("SELECT * FROM organizations");
    const featuredOrganization = organizations
      .map((org) => ({
        ...normalizeOrganization(org),
        score: scoreJob(currentVolunteer, org),
        match_reasons: explainJobFit(currentVolunteer, org),
      }))
      .sort((first, second) => second.score - first.score)[0];

    if (!featuredOrganization) {
      return res.json(null);
    }

    const similarVolunteers = findTopSimilarVolunteers(currentVolunteer, volunteers, 3);
    const teamRecommendation = recommendVolunteerTeam(
      currentVolunteer,
      featuredOrganization,
      volunteers,
      similarVolunteers
    );

    return res.json(teamRecommendation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});



