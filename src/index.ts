import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses} from "./api/middleware/logger.js";
import { middlewareMetricsInc} from "./api/middleware/hitTracker.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { errorHandler } from "./api/middleware/errorMiddleware.js";
import { config } from "./config.js";
import { handlerUsersCreate } from "./api/createUser.js";
import { createChirpHandler, getAllChirpsHandler, getChirpByIDHandler } from "./api/chirps.js";

const migrationClient = postgres(config.db.url, { max: 1});
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();


app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());
app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerUsersCreate(req, res).catch(next));
});

app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(createChirpHandler(req, res).catch(next));
});

app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(getAllChirpsHandler(req, res).catch(next));
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(getChirpByIDHandler(req, res).catch(next));
});

app.use(errorHandler);


app.listen(config.api.port, () => {
    console.log(`Server is running at http://localhost:${config.api.port}`);
});
