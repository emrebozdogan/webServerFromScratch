import { Request, Response } from "express";
import { upgradeUser } from "../db/queries/users.js";
import { notFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerUserUpgrade(req: Request, res: Response) {
    type shape = {
        event: string,
        data: { userId: string},
    };

    const api_key = await getAPIKey(req);

    const params: shape = req.body;
    const userID = params?.data?.userId;
    if (!userID) {
        throw new notFoundError("user not found");
    }
    if (api_key === config.api.polka) {
        if (params.event === "user.upgraded") {
            await upgradeUser(userID);
            res.status(204).send();
            return;
        } else {
            respondWithJSON(res, 204, {});
            return;
        }
    } else {
        res.status(401).send();
        return;
    }
    
}