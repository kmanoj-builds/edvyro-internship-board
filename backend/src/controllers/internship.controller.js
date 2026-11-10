function publicRecord(record) {
  if (!record) return record;
  const { skills_json, ...data } = record;
  let skills = [];
  if (skills_json) {
    try { skills = JSON.parse(skills_json); } catch { skills = []; }
  }
  return { ...data, skills };
}

export function createInternshipController(database) {
  const find = database.prepare("SELECT * FROM internships WHERE id = ?");
  const validate = (request, pathId) => {
    const errors = request.app.locals.validation.validateInternship(request.body, { pathId });
    if (!errors.length) request.normalized = request.app.locals.validation.normalizeInternship(request.body);
    return errors;
  };
  return {
    health(_request, response) {
      response.json({ status: "success", message: "API is healthy", data: { database: "connected" } });
    },
    list(request, response) {
      const { page, limit, errors } = request.pagination;
      if (errors.length) return response.status(400).json({ status: "error", message: "Invalid pagination.", errors });
      const totalRecords = database.prepare("SELECT COUNT(*) AS count FROM internships").get().count;
      const totalPages = Math.ceil(totalRecords / limit);
      const data = database.prepare("SELECT * FROM internships ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
      return response.json({
        status: "success", message: "Request completed successfully", data: data.map(publicRecord),
        pagination: { page, limit, totalRecords, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 && totalPages > 0 },
      });
    },
    get(request, response) {
      const record = find.get(request.params.id);
      if (!record) return response.status(404).json({ status: "error", message: "Internship not found.", errors: [] });
      return response.json({ status: "success", message: "Request completed successfully", data: publicRecord(record) });
    },
    create(request, response) {
      const errors = validate(request);
      if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship data.", errors });
      try {
        database.prepare("INSERT INTO internships (id, title, domain, mode, duration_weeks, applications_open) VALUES (@id, @title, @domain, @mode, @duration_weeks, @applications_open)").run(request.normalized);
      } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_PRIMARYKEY" || error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return response.status(409).json({ status: "error", message: "An internship with this id already exists.", errors: [] });
        }
        throw error;
      }
      return response.status(201).json({ status: "success", message: "Internship created successfully", data: publicRecord(find.get(request.normalized.id)) });
    },
    update(request, response) {
      const errors = validate(request, request.params.id);
      if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship data.", errors });
      if (!find.get(request.params.id)) return response.status(404).json({ status: "error", message: "Internship not found.", errors: [] });
      database.prepare("UPDATE internships SET title=@title, domain=@domain, mode=@mode, duration_weeks=@duration_weeks, applications_open=@applications_open WHERE id=@id").run(request.normalized);
      return response.json({ status: "success", message: "Internship updated successfully", data: publicRecord(find.get(request.params.id)) });
    },
    remove(request, response) {
      try {
        const result = database.prepare("DELETE FROM internships WHERE id = ?").run(request.params.id);
        if (!result.changes) return response.status(404).json({ status: "error", message: "Internship not found.", errors: [] });
      } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") return response.status(409).json({ status: "error", message: "Internship has applications and cannot be deleted.", errors: [] });
        throw error;
      }
      return response.json({ status: "success", message: "Internship deleted successfully", data: null });
    },
    apply(request, response) {
      const { name, email } = request.body;
      const errors = [];
      if (typeof name !== "string" || name.trim().length < 2) errors.push("name must contain at least 2 characters.");
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email must be a valid email address.");
      if (errors.length) return response.status(400).json({ status: "error", message: "Invalid application data.", errors });
      if (!find.get(request.params.id)) return response.status(404).json({ status: "error", message: "Internship not found.", errors: [] });
      try {
        const result = database.prepare(
          "INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)"
        ).run(request.params.id, name.trim(), email.trim().toLowerCase());
        return response.status(201).json({
          status: "success",
          message: "Application submitted successfully.",
          data: { id: result.lastInsertRowid, internshipId: request.params.id },
        });
      } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
          return response.status(409).json({ status: "error", message: "This email has already applied for this internship.", errors: [] });
        }
        throw error;
      }
    },
  };
}
