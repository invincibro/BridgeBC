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
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/volunteers/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM volunteers WHERE volunteer_id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Volunteer not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Organizations ---
app.get("/api/organizations", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM organizations ORDER BY legal_name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});