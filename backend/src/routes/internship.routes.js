import { Router } from "express";
import { parsePagination, validateId } from "../validators/internship.validator.js";

export function createInternshipRoutes(controller) {
  const router = Router();
  router.get("/", (request, response, next) => {
    request.pagination = parsePagination(request.query);
    try { return controller.list(request, response); } catch (error) { return next(error); }
  });
  router.get("/:id", (request, response, next) => {
    const errors = validateId(request.params.id);
    if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship id.", errors });
    try { return controller.get(request, response); } catch (error) { return next(error); }
  });
  router.post("/:id/applications", (request, response, next) => {
    const errors = validateId(request.params.id);
    if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship id.", errors });
    try { return controller.apply(request, response); } catch (error) { return next(error); }
  });
  router.post("/", (request, response, next) => { try { return controller.create(request, response); } catch (error) { return next(error); } });
  router.put("/:id", (request, response, next) => {
    const errors = validateId(request.params.id);
    if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship id.", errors });
    try { return controller.update(request, response); } catch (error) { return next(error); }
  });
  router.delete("/:id", (request, response, next) => {
    const errors = validateId(request.params.id);
    if (errors.length) return response.status(400).json({ status: "error", message: "Invalid internship id.", errors });
    try { return controller.remove(request, response); } catch (error) { return next(error); }
  });
  return router;
}
