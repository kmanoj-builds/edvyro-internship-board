
# InternBoard – Responsive Internship Board

A responsive internship listing platform built using HTML, CSS, and Vanilla JavaScript.

InternBoard helps users explore internship opportunities across different technical domains, search for relevant roles, filter listings, view internship details, and complete an application form.

## Features

- Display internship opportunities dynamically.
- Search internships by title, domain, location, and skills.
- Filter internships by domain.
- Filter internships by work mode:
  - Remote
  - Hybrid
  - On-site
- View detailed internship information.
- Application form with client-side validation.
- Responsive layout for mobile, tablet, and desktop.
- Empty-state message when no internships match the filters.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES Modules)
- Git and GitHub

## Project Structure

```text
edvyro-internship-board/
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   └── data.js
│   │
│   └── assets/
│
├── backend/
│
├── screenshots/
│
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the project

Navigate to the frontend folder.

### 3. Run the application

Open `frontend/index.html` using a local development server such as VS Code Live Server.

## Application Data

The application currently uses sample internship records stored in `frontend/js/data.js`.

## Application Submission

The application form currently performs client-side validation.

Backend integration and persistent application storage are not implemented in this frontend version.

## Task 3 Backend API

The Task 3 implementation is in [`backend/`](./backend/). It provides a tested Node.js + Express REST API with persistent SQLite storage, repeatable schema initialization, official EdVyro seed import, validation, pagination, and foreign-key-safe deletion.

### Run the backend

```bash
cd backend
npm install
copy .env.example .env
npm start
```

Run the isolated API tests with `npm test` from `backend/`. The API base URL is `http://localhost:5000/api`; endpoint details, request examples, schema mapping, and response formats are in [`backend/README.md`](./backend/README.md).

### Task 3 endpoints

- `GET /health`
- `GET /internships?page=1&limit=10`
- `GET /internships/:id`
- `POST /internships`
- `PUT /internships/:id` (full update)
- `DELETE /internships/:id`
- `POST /internships/:id/applications`

The frontend now loads internships from the backend and submits applications through the API. If the backend is unavailable, it falls back to the existing Task 2 sample data.

## Responsive Design

The interface is designed for:

- Mobile devices
- Tablets
- Desktop screens

## Author

Built as part of the Edvyro Internship – Task 2.

## License

This project is developed for educational and internship purposes.
