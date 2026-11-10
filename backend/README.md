# Internship Board API

Task 3 backend for the InternBoard project. It is an Express REST API backed by persistent SQLite via `better-sqlite3`.

## Setup

Requires Node.js 18 or newer.

```bash
cd backend
npm install
copy .env.example .env
npm start
```

The API listens at `http://localhost:5000` by default. `DATABASE_PATH` may be absolute or relative to the backend working directory. `CORS_ORIGIN` accepts a comma-separated origin list.

Initialization executes [`database/schema.sql`](./database/schema.sql), enables foreign keys, and idempotently imports [`database/internship-records-sample.json`](./database/internship-records-sample.json). The supplied SQL starter rows (`INT-001` through `INT-004`) are retained. The official JSON has no `duration_weeks`; imported records use `0` to represent unspecified duration, while API-created records require a positive duration. JSON-only fields are preserved in `location`, `skills_json`, and `openings` columns.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/internships?page=1&limit=10` | Paginated list |
| GET | `/api/internships/:id` | Details |
| POST | `/api/internships` | Create |
| PUT | `/api/internships/:id` | Full update; `id` cannot change |
| DELETE | `/api/internships/:id` | Delete, unless applications reference it |
| POST | `/api/internships/:id/applications` | Submit an application |

Successful responses contain `status`, `message`, and `data`. Lists additionally contain `pagination`. Errors contain `status`, `message`, and `errors`.

### Examples

```bash
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/internships?page=1&limit=10"
curl http://localhost:5000/api/internships/INT-101
curl -X POST http://localhost:5000/api/internships -H "Content-Type: application/json" -d "{\"id\":\"INT-200\",\"title\":\"QA Intern\",\"domain\":\"Testing\",\"mode\":\"Remote\",\"duration_weeks\":6}"
curl -X PUT http://localhost:5000/api/internships/INT-200 -H "Content-Type: application/json" -d "{\"id\":\"INT-200\",\"title\":\"Senior QA Intern\",\"domain\":\"Testing\",\"mode\":\"Hybrid\",\"duration_weeks\":8,\"applications_open\":true}"
curl -X DELETE http://localhost:5000/api/internships/INT-200
curl -X POST http://localhost:5000/api/internships/INT-101/applications -H "Content-Type: application/json" -d "{\"name\":\"Alex Student\",\"email\":\"alex@example.com\"}"
```

PowerShell users can use `Invoke-RestMethod` with equivalent methods and JSON bodies.

## Validation and status codes

Modes are `Remote`, `Hybrid`, and `On-site`. IDs and text fields cannot be empty, durations must be positive integers, and `applications_open` accepts booleans or `0`/`1`. Statuses are `200` for reads/updates/deletes, `201` for creation, `400` for invalid input, `404` for missing routes or records, `409` for duplicate or foreign-key conflicts, and `500` for unexpected failures.

## Tests

```bash
npm test
```

Tests use a temporary database and never modify the normal development database.
