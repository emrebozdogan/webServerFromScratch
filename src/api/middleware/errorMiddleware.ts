import type { NextFunction, Request, Response } from "express";
import { badRequestError, unauthorizedError, forbiddenError, notFoundError } from "../errors.js";
import { respondWithError } from "../json.js";

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    let statusCode = 500;
    let message = "Something went wrong on our end";

    if (err instanceof badRequestError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof unauthorizedError) {
        statusCode = 401;
        message = err.message;
    } else if (err instanceof forbiddenError) {
        statusCode = 403;
        message = err.message;
    } else if (err instanceof notFoundError) {
        statusCode = 404;
        message = err.message;
    } 
    if (statusCode >= 500) {
        console.log(err.message);
    }
    respondWithError(res, statusCode, message);
}

