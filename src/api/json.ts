import { Response } from "express";

export function respondWithJSON(res: Response, code: number, data: object) {
    res.header("Content-Type", "application/json");
    const body = JSON.stringify(data);
    res.status(code).send(body);
}

export function respondWithError(res: Response, code: number, message: string) {
    respondWithJSON(res, code, { error: message });
}