import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function seedDatabase(database, seedPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "internship-records-sample.json")) {
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  if (!Array.isArray(seed.internships)) throw new Error("Official seed JSON must contain an internships array.");
  const insert = database.prepare(`
    INSERT OR IGNORE INTO internships
      (id, title, domain, mode, duration_weeks, applications_open, location, skills_json, openings)
    VALUES (@id, @title, @domain, @mode, @duration_weeks, @applications_open, @location, @skills_json, @openings)
  `);
  database.transaction((records) => {
    for (const record of records) {
      insert.run({
        ...record,
        duration_weeks: 0,
        applications_open: record.openings > 0 ? 1 : 0,
        skills_json: JSON.stringify(record.skills),
      });
    }
  })(seed.internships);
}
