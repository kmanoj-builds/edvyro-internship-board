import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const databaseDirectory = path.dirname(fileURLToPath(import.meta.url));

export function openDatabase(databasePath = process.env.DATABASE_PATH) {
  const resolvedPath = databasePath
    ? (path.isAbsolute(databasePath) ? databasePath : path.resolve(databaseDirectory, "..", databasePath))
    : path.join(databaseDirectory, "internship-board.db");
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  const database = new Database(resolvedPath);
  database.pragma("foreign_keys = ON");
  database.exec(fs.readFileSync(path.join(databaseDirectory, "schema.sql"), "utf8"));

  const columns = database.prepare("PRAGMA table_info(internships)").all().map((column) => column.name);
  for (const [name, definition] of [["location", "TEXT"], ["skills_json", "TEXT"], ["openings", "INTEGER"]]) {
    if (!columns.includes(name)) database.exec(`ALTER TABLE internships ADD COLUMN ${name} ${definition}`);
  }
  return database;
}
