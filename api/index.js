const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
)

app.use(express.json());

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

app.get('/api/roles', (request, response) => {
  response.json(roles)
})

app.get('/api/volunteers', (request, response) => {
  response.json(volunteers)
})

app.get('/api/volunteers/:id', (request, response) => {
  const volunteer = volunteers.find((item) => item.id === request.params.id)

  if (!volunteer) {
    return response.status(404).json({ message: 'Volunteer not found' })
  }

  return response.json(volunteer)
})

app.get('/api/continuity-notes', (request, response) => {
  response.json(continuityNotes)
})



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

