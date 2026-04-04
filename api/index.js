const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { scoreJob } = require("./scorer/scoreJob");

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

function buildTaskTitle(row) {
  if (row.skills_needed?.length) {
    return `${row.skills_needed[0]} support`;
  }

  return `${row.org_name || row.account_name || row.legal_name} volunteer need`;
}

function normalizeTask(row) {
  const organization = normalizeOrganization(row);
  const primarySkill = row.skills_needed?.[0] || "";
  const primarySkill = row.skills_needed?.[0] || "";

  return {
    id: `org-task-${row.id}`,
    org_id: row.id,
    task_title: buildTaskTitle(organization),
    task_description: `Volunteer support needed for ${organization.org_name}.`,
    task_category: primarySkill,
    skills_needed: row.skills_needed || [],
    languages_needed: row.languages_needed || [],
    availability_preference: row.availability_preference || "",
    availability_needed: row.availability_preference || "",
    volunteers_currently_needed: row.volunteers_currently_needed || 1,
    volunteer_urgency: row.volunteer_urgency || "Medium",
    urgency: row.volunteer_urgency || "Medium",
    location_type: row.city ? "In person" : "Remote",
    background_check_required: row.background_check_required,
    status: "Open",
    organization,
  };
}

function normalizeVolunteer(row) {
  const availabilityOptions = row.availability
    ? row.availability
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
    : [];

  return {
    id: row.volunteer_id,
    volunteer_id: row.volunteer_id,
    first_name: row.first_name,
    last_name: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    age: row.age,
    neighbourhood: row.neighbourhood || "",
    languages_spoken: row.languages_spoken || [],
    skills: row.skills || [],
    cause_areas_of_interest: row.cause_areas_of_interest || [],
    interests: row.cause_areas_of_interest || [],
    availability: row.availability || "",
    availability_options: availabilityOptions,
    hours_available_per_month: row.hours_available_per_month || 0,
    prior_volunteer_experience: row.prior_volunteer_experience || "None",
    experience_level: row.prior_volunteer_experience || "None",
    has_vehicle: row.has_vehicle,
    background_check_status: row.background_check_status || "Not yet",
    pastRoles: [],
  };
}

function mapVolunteerExperience(value) {
  const options = {
    None: "None",
    "Some (1-2 orgs)": "Some (1-2 orgs)",
    "Experienced (3+ orgs)": "Experienced (3+ orgs)",
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
    neighbourhood,
    languages_spoken,
    skills,
    interests,
    availability,
    hours_available_per_month,
    experience_level,
    has_vehicle,
    background_check_status,
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "first_name and last_name are required." });
  }

  try {
    const nextIdResult = await pool.query(
      `SELECT CONCAT('VOL-', LPAD(COALESCE(MAX(id), 0)::text, 3, '0')) AS current_code,
              COALESCE(MAX(id), 0) + 1 AS next_number
       FROM volunteers`
    );

    const volunteerCode = `VOL-${String(nextIdResult.rows[0].next_number).padStart(3, "0")}`;

    const { rows } = await pool.query(
      `INSERT INTO volunteers (
        volunteer_id, first_name, last_name, neighbourhood, languages_spoken, skills,
        cause_areas_of_interest, availability, hours_available_per_month,
        prior_volunteer_experience, has_vehicle, background_check_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING volunteer_id, first_name, last_name, neighbourhood, languages_spoken,
                skills, cause_areas_of_interest, availability, hours_available_per_month,
                prior_volunteer_experience, has_vehicle, background_check_status`,
      [
        volunteerCode,
        first_name,
        last_name,
        neighbourhood || null,
        languages_spoken || [],
        skills || [],
        interests || [],
        Array.isArray(availability) ? availability.join("; ") : availability || null,
        Number(hours_available_per_month || 0),
        mapVolunteerExperience(experience_level),
        Boolean(has_vehicle),
        mapBackgroundStatus(background_check_status),
      ]
    );

    res.status(201).json(normalizeVolunteer(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// --- Organizations ---


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
  } = req.body;

  if (!BN || !legal_name) {
    return res.status(400).json({ message: "BN and legal_name are required." });
  }
});


// --- Recommended organizations for a volunteer ---
app.get("/api/volunteers/:id/recommended-organizations", async (req, res) => {
  try {
    const { rows: volunteers } = await pool.query(
      "SELECT * FROM volunteers WHERE volunteer_id = $1",
      [req.params.id]
    );
    if (volunteers.length === 0) return res.status(404).json({ message: "Volunteer not found" });

    const volunteer = volunteers[0];
    const { rows: organizations } = await pool.query("SELECT * FROM organizations");

    const ranked = organizations
      .map((org) => ({ ...org, score: scoreJob(volunteer, org) }))
      .sort((a, b) => b.score - a.score);

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, bn, legal_name, account_name, city, sector, org_size,
              volunteers_currently_needed, volunteer_urgency, skills_needed,
              languages_needed, availability_preference, background_check_required
       FROM organizations
       WHERE volunteers_currently_needed IS NOT NULL
          OR volunteer_urgency IS NOT NULL
          OR skills_needed IS NOT NULL
          OR languages_needed IS NOT NULL
          OR availability_preference IS NOT NULL
       ORDER BY id DESC`
    );

    res.json(rows.map(normalizeTask));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  const {
    org_id,
    skills_needed,
    languages_needed,
    availability_preference,
    volunteers_currently_needed,
    volunteer_urgency,
    background_check_required,
  } = req.body;

  if (!org_id) {
    return res.status(400).json({ message: "org_id is required." });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE organizations
       SET volunteers_currently_needed = $1,
           volunteer_urgency = $2,
           skills_needed = $3,
           languages_needed = $4,
           availability_preference = $5,
           background_check_required = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, bn, legal_name, account_name, city, sector, org_size,
                 volunteers_currently_needed, volunteer_urgency, skills_needed,
                 languages_needed, availability_preference, background_check_required`,
      [
        Number(volunteers_currently_needed || 1),
        volunteer_urgency || "Medium",
        skills_needed || [],
        languages_needed || [],
        availability_preference || null,
        Boolean(background_check_required),
        Number(org_id),
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Organization not found." });
    }

    res.status(201).json(normalizeTask(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/volunteers", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT volunteer_id, first_name, last_name, age, neighbourhood, languages_spoken,
              skills, cause_areas_of_interest, availability, hours_available_per_month,
              prior_volunteer_experience, has_vehicle, background_check_status
       FROM volunteers
       ORDER BY id DESC`
    );

    res.json(rows.map(normalizeVolunteer));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/volunteers/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT volunteer_id, first_name, last_name, age, neighbourhood, languages_spoken,
              skills, cause_areas_of_interest, availability, hours_available_per_month,
              prior_volunteer_experience, has_vehicle, background_check_status
       FROM volunteers
       WHERE volunteer_id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    res.json(normalizeVolunteer(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ message: "first_name and last_name are required." });
  }

  try {
    const nextIdResult = await pool.query(
      `SELECT CONCAT('VOL-', LPAD(COALESCE(MAX(id), 0)::text, 3, '0')) AS current_code,
              COALESCE(MAX(id), 0) + 1 AS next_number
       FROM volunteers`
    );

    const volunteerCode = `VOL-${String(nextIdResult.rows[0].next_number).padStart(3, "0")}`;

    const { rows } = await pool.query(
      `INSERT INTO volunteers (
        volunteer_id, first_name, last_name, age, neighbourhood, languages_spoken, skills,
        cause_areas_of_interest, availability, hours_available_per_month,
        prior_volunteer_experience, has_vehicle, background_check_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING volunteer_id, first_name, last_name, age, neighbourhood, languages_spoken,
                skills, cause_areas_of_interest, availability, hours_available_per_month,
                prior_volunteer_experience, has_vehicle, background_check_status`,
      [
        volunteerCode,
        first_name,
        last_name,
        age || null,
        neighbourhood || null,
        languages_spoken || [],
        skills || [],
        cause_areas_of_interest || [],
        availability || null,
        Number(hours_available_per_month || 0),
        mapVolunteerExperience(prior_volunteer_experience),
        Boolean(has_vehicle),
        mapBackgroundStatus(background_check_status),
      ]
    );

    res.status(201).json(normalizeVolunteer(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/continuity-notes", async (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
