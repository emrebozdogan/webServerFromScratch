import type { Request, Response } from "express";
import { createChirp, getAllChirps, getChirpByID } from "../db/queries/chrips.js";
import { respondWithError, respondWithJSON} from "./json.js";
import { badRequestError, notFoundError } from "./errors.js";

export async function createChirpHandler(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId: string;
    };

    
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
        userId: params.userId,
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