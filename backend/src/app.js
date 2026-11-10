import express from "express";
import cors from "cors";
import * as validation from "./validators/internship.validator.js";
import { createInternshipController } from "./controllers/internship.controller.js";
import { createInternshipRoutes } from "./routes/internship.routes.js";

export function createApp(database) {
  const app = express();
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*";
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: "100kb" }));
  app.locals.validation = validation;
  const controller = createInternshipController(database);
  app.get("/", (_request, response) => {
    response.json({
      status: "success",
      message: "Internship Board API is running.",
      data: {
        baseUrl: "/api",
        health: "/api/health",
        internships: "/api/internships",
      },
    });
  });
  app.get("/api/health", controller.health);
  app.use("/api/internships", createInternshipRoutes(controller));
  app.use("/api", (_request, response) => response.status(404).json({ status: "error", message: "API route not found.", errors: [] }));
  app.use((_request, response) => response.status(404).json({ status: "error", message: "Route not found.", errors: [] }));
  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
      return response.status(400).json({ status: "error", message: "Malformed JSON request body.", errors: [] });
    }
    console.error(error);
    return response.status(500).json({ status: "error", message: "Internal server error.", errors: [] });
  });
  return app;
}
