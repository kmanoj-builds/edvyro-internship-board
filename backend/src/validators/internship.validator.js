const modes = new Set(["Remote", "Hybrid", "On-site"]);

const isString = (value) => typeof value === "string" && value.trim().length > 0;

export function validateId(id) {
  return isString(id) ? [] : ["id must be a non-empty string."];
}

export function validateInternship(body, { pathId } = {}) {
  const errors = [];
  for (const field of ["id", "title", "domain", "mode", "duration_weeks"]) {
    if (!(field in body)) errors.push(`${field} is required.`);
  }
  for (const field of ["id", "title", "domain", "mode"]) {
    if (field in body && !isString(body[field])) errors.push(`${field} must be a non-empty string.`);
  }
  if (body.mode !== undefined && !modes.has(body.mode)) errors.push("mode must be one of Remote, Hybrid, or On-site.");
  if (body.duration_weeks !== undefined && (!Number.isInteger(body.duration_weeks) || body.duration_weeks <= 0)) {
    errors.push("duration_weeks must be a positive integer.");
  }
  if (body.applications_open !== undefined && ![true, false, 0, 1, "0", "1"].includes(body.applications_open)) {
    errors.push("applications_open must be a boolean or 0/1.");
  }
  if (pathId !== undefined && body.id !== pathId) errors.push("id cannot be changed in a PUT request.");
  return errors;
}

export function normalizeInternship(body) {
  return {
    id: body.id.trim(),
    title: body.title.trim(),
    domain: body.domain.trim(),
    mode: body.mode,
    duration_weeks: body.duration_weeks,
    applications_open: [true, 1, "1"].includes(body.applications_open ?? true) ? 1 : 0,
  };
}

export function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  const errors = [];
  if (!Number.isInteger(page) || page < 1) errors.push("page must be a positive integer.");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) errors.push("limit must be an integer between 1 and 100.");
  return { page, limit, errors };
}
