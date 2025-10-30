import { config } from "../config.js";
import { Request, Response, NextFunction } from "express";

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
};