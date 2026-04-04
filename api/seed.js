const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const DATABASE_URL = "postgresql://admin:secret@localhost:6543/appdb"
const pool = new Pool({ connectionString: DATABASE_URL });

// Parse semicolon-separated values into a PG array
function toArray(val) {
  if (!val || val.trim() === "") return [];
  return val.split(";").map((s) => s.trim());
}

function toBool(val) {
  return val?.trim().toLowerCase() === "yes";
}

// Minimal CSV parser (handles quoted fields with commas inside)
function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

async function seedVolunteers(client, filePath) {
  const rows = parseCSV(filePath);
  console.log(`\nSeeding volunteers from ${path.basename(filePath)}...`);

  for (const row of rows) {
    await client.query(
      `INSERT INTO volunteers (
        volunteer_id, first_name, last_name, age, neighbourhood,
        languages_spoken, skills, cause_areas_of_interest,
        availability, hours_available_per_month,
        prior_volunteer_experience, has_vehicle, background_check_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (volunteer_id) DO NOTHING`,
      [
        row["volunteer_ID"],
        row["first_name"],
        row["last_name"],
        parseInt(row["age"]),
        row["neighbourhood"],
        toArray(row["languages_spoken"]),
        toArray(row["skills"]),
        toArray(row["cause_areas_of_interest"]),
        row["availability"],
        parseInt(row["hours_available_per_month"]),
        row["prior_volunteer_experience"],
        toBool(row["has_vehicle"]),
        row["background_check_status"],
      ]
    );
    console.log(`  inserted ${row["volunteer_ID"]} - ${row["first_name"]} ${row["last_name"]}`);
  }
}

async function seedOrganizations(client, filePath) {
  const rows = parseCSV(filePath);
  console.log(`\nSeeding organizations from ${path.basename(filePath)}...`);

  for (const row of rows) {
    await client.query(
      `INSERT INTO organizations (
        bn, legal_name, account_name,
        address1, address2, city, province, postal_code, country,
        sector, org_size, volunteers_currently_needed, volunteer_urgency,
        skills_needed, languages_needed,
        availability_preference, background_check_required
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (bn) DO NOTHING`,
      [
        row["BN"],
        row["legal_name"],
        row["account_name"],
        row["address1"],
        row["address2"],
        row["city"],
        row["province"],
        row["postal_code"],
        row["country"],
        row["sector"],
        row["org_size"],
        parseInt(row["volunteers_currently_needed"]),
        row["volunteer_urgency"],
        toArray(row["skills_needed"]),
        toArray(row["languages_needed"]),
        row["availability_preference"],
        toBool(row["background_check_required"]),
      ]
    );
    console.log(`  inserted ${row["BN"]} - ${row["legal_name"]}`);
  }
}

async function seed() {
  const client = await pool.connect();

  try {
    const dataDir = path.join(__dirname, "data");

    await seedVolunteers(client, path.join(dataDir, "mock-volunteer-profile.csv"));
    await seedOrganizations(client, path.join(dataDir, "mock-organizations.csv"));

    console.log("\nSeed complete.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();