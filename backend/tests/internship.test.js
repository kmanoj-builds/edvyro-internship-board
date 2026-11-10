import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { createApp } from "../src/app.js";
import { openDatabase } from "../database/database.js";
import { seedDatabase } from "../database/seed.js";

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "internship-api-"));
const databasePath = path.join(temporaryDirectory, "test.db");
const database = openDatabase(databasePath);
seedDatabase(database);
const server = createApp(database).listen(0);
const baseUrl = await new Promise((resolve) => server.once("listening", () => resolve(`http://localhost:${server.address().port}`)));

async function request(route, options) {
  const response = await fetch(`${baseUrl}${route}`, options);
  return { response, body: await response.json() };
}

before(() => assert.equal(database.prepare("SELECT COUNT(*) AS count FROM internships").get().count, 9));
after(() => {
  server.close();
  database.close();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test("health check", async () => {
  const { response, body } = await request("/api/health");
  assert.equal(response.status, 200);
  assert.equal(body.status, "success");
});

test("list and pagination", async () => {
  const { response, body } = await request("/api/internships?page=2&limit=3");
  assert.equal(response.status, 200);
  assert.equal(body.data.length, 3);
  assert.deepEqual(body.pagination, { page: 2, limit: 3, totalRecords: 9, totalPages: 3, hasNextPage: true, hasPreviousPage: true });
});

test("invalid pagination is rejected", async () => {
  const { response } = await request("/api/internships?page=0&limit=101");
  assert.equal(response.status, 400);
});

test("get existing and missing internships", async () => {
  assert.equal((await request("/api/internships/INT-101")).response.status, 200);
  assert.equal((await request("/api/internships/does-not-exist")).response.status, 404);
});

test("submit applications and reject duplicates", async () => {
  const options = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "API Applicant", email: "api-applicant@example.com" }),
  };
  assert.equal((await request("/api/internships/INT-101/applications", options)).response.status, 201);
  assert.equal((await request("/api/internships/INT-101/applications", options)).response.status, 409);
  assert.equal((await request("/api/internships/INT-101/applications", { ...options, body: JSON.stringify({ name: "A", email: "bad" }) })).response.status, 400);
  assert.equal((await request("/api/internships/MISSING/applications", options)).response.status, 404);
});

test("create validates and rejects duplicate ids", async () => {
  const record = { id: "TEST-001", title: "Test Internship", domain: "Testing", mode: "Remote", duration_weeks: 8 };
  const created = await request("/api/internships", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(record) });
  assert.equal(created.response.status, 201);
  assert.equal((await request("/api/internships", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(record) })).response.status, 409);
  assert.equal((await request("/api/internships", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...record, id: "TEST-002", mode: "Invalid" }) })).response.status, 400);
});

test("malformed JSON is rejected", async () => {
  const { response } = await request("/api/internships", { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
  assert.equal(response.status, 400);
});

test("update requires a full body and supports valid updates", async () => {
  const record = { id: "TEST-001", title: "Updated Internship", domain: "Testing", mode: "Hybrid", duration_weeks: 9, applications_open: false };
  const updated = await request("/api/internships/TEST-001", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(record) });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.title, "Updated Internship");
  assert.equal((await request("/api/internships/MISSING", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...record, id: "MISSING" }) })).response.status, 404);
});

test("delete handles missing records and foreign keys", async () => {
  database.prepare("INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)").run("TEST-001", "Test Applicant", "test@example.com");
  assert.equal((await request("/api/internships/TEST-001", { method: "DELETE" })).response.status, 409);
  database.prepare("DELETE FROM applications WHERE internship_id = ?").run("TEST-001");
  assert.equal((await request("/api/internships/TEST-001", { method: "DELETE" })).response.status, 200);
  assert.equal((await request("/api/internships/MISSING", { method: "DELETE" })).response.status, 404);
});

test("database persists after reopening", () => {
  const reopened = openDatabase(databasePath);
  assert.equal(reopened.prepare("SELECT title FROM internships WHERE id = ?").get("INT-101").title, "Frontend Intern");
  reopened.close();
});
