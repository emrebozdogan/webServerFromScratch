import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses} from "./middleware/logger.js";
import { middlewareMetricsInc} from "./middleware/hitTracker.js";
import { handlerLogRequests } from "./api/logRequests.js";
import { config } from "./config.js";
import { NextFunction } from "express";

const app = express();

const PORT = 8080;

app.use("/app", middlewareMetricsInc);
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerLogRequests);
app.get("/reset", (req, res) => {
    config.fileserverHits = 0;
    res.status(200).send("OK");
});
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponses);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});





