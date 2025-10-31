import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses} from "./api/middleware/logger.js";
import { middlewareMetricsInc} from "./api/middleware/hitTracker.js";
import { handlerLogRequests } from "./api/logRequests.js";
import { handlerMetrics } from "./api/metrics.js";
import { config } from "./config.js";

const app = express();

const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", (req, res) => {
    config.fileserverHits = 0;
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});





