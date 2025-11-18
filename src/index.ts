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
import { handlerUsersChangeInfos, handlerUsersCreate } from "./api/users.js";
import { createChirpHandler, getAllChirpsHandler, getChirpByIDHandler, getChirps, handlerDeleteChirp } from "./api/chirps.js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/login.js";
import { handlerUserUpgrade } from "./api/webhooks.js";

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

app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res).catch(next));
});

app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res).catch(next));
});

app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res).catch(next));
});

app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUserUpgrade(req, res).catch(next));
});

app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(getChirps(req, res).catch(next));
});

app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(getChirpByIDHandler(req, res).catch(next));
});

app.put("/api/users", (req ,res, next) => {
    Promise.resolve(handlerUsersChangeInfos(req, res).catch(next));
});

app.delete("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res).catch(next));
});

app.use(errorHandler);


app.listen(config.api.port, () => {
    console.log(`Server is running at http://localhost:${config.api.port}`);
});
