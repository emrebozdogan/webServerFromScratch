import type { Request, Response } from "express";
import { forbiddenError } from "./errors.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { config } from "../config.js";

export async function handlerReset(req: Request, res: Response) {
    if (config.api.platform !== "dev") {
        throw new forbiddenError("not accessible");
    }
    config.api.fileServerHits = 0;
    await deleteAllUsers();
    
    res.write("Hits reset to 0");
    res.end();
}