import "dotenv/config";
import { createApp } from "./src/app.js";
import { openDatabase } from "./database/database.js";
import { seedDatabase } from "./database/seed.js";

const database = openDatabase();
seedDatabase(database);
const app = createApp(database);
const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () => console.log(`Internship API listening on port ${port}`));

function shutdown() {
  server.close(() => database.close());
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
