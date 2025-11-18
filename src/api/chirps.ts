import type { Request, Response } from "express";
import { createChirp, deleteChripByID, getAllChirps, getChirpByID, getChirpByUserID } from "../db/queries/chrips.js";
import { respondWithError, respondWithJSON} from "./json.js";
import { badRequestError, forbiddenError, notFoundError, unauthorizedError } from "./errors.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

export async function createChirpHandler(req: Request, res: Response) {
    type parameters = {
        body: string;
    };
    const token = getBearerToken(req);
    const userID = validateJWT(token, config.jwt.secret);
    
    const profane = ["kerfuffle", "sharbert", "fornax"];

    let params: parameters = req.body
    const paramsList = params.body.split(" ");
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new badRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
    }
    
    for (let word of paramsList) {
        if (profane.includes(word.toLowerCase()) && !word.endsWith("!")) {
            params.body = params.body.replace(word, "****");
        }
    }
    const chirp = await createChirp({ 
        body: params.body,
        userId: userID,
    });


    respondWithJSON(res, 201, {
        "id": chirp.id,
        "createdAt": chirp.createdAt,
        "updatedAt": chirp.updatedAt,
        "body": chirp.body,
        "userId": chirp.userId,
    });
}


export async function getAllChirpsHandler(req: Request, res: Response) {
    const chirps = await getAllChirps();
    respondWithJSON(res, 200, chirps);
}


export async function getChirpByIDHandler(req: Request, res: Response) {
    const chirp = await getChirpByID(req.params.chirpID);
    if (typeof chirp === "undefined") {
        throw new notFoundError(`not found`);
    }; 
    respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
    const chirp = await getChirpByID(req.params.chirpID);
    if (typeof chirp === "undefined") {
        throw new notFoundError(`not found`);
    };
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwt.secret);

    if (chirp.userId === userId) {
        deleteChripByID(chirp.id);
    } else {
        throw new forbiddenError("not allowed to delete this chirp");
    }

    res.status(204).send();
}

export async function getChirps(req: Request, res: Response) {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    let order = "";
    let orderQuery = req.query.sort;
    let chirps = [];
    
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
        chirps = await getChirpByUserID(authorId);
    } else {
        chirps = await getAllChirps();
    }

    if ( typeof orderQuery === "string" ){
        if ( orderQuery !== "desc") {
            const sortedChirps = chirps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            respondWithJSON(res, 200, sortedChirps);
            return;
        } else {
            const sortedChirps = chirps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            respondWithJSON(res, 200, sortedChirps);
            return;
        }
    }
    respondWithJSON(res, 200, chirps);
}