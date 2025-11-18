import type { Request, Response } from "express";
import { findUserByEmail } from "../db/queries/users.js";
import { checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "../auth.js";
import { unauthorizedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { config } from "../config.js";
import type { UserResponse } from "./users.js";
import { revokeRefreshToken, saveRefreshToken, userForRefreshToken } from "../db/queries/refresh.js";

type LoginResponse = UserResponse & {
    token: string,
    refreshToken: string,
};

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string,
        password: string,
    };

    let params: parameters = req.body;
    const user = await findUserByEmail(params.email);
    if (!user) {
        throw new unauthorizedError("invalid username or password");
    };

    const matching = await checkPasswordHash(params.password, user.hashedPassword);
    if (!matching) {
        throw new unauthorizedError("invalid username or password");
    };
    

    const accessToken = makeJWT(
        user.id,
        config.jwt.defaultDuration,
        config.jwt.secret
    );
    const refreshToken = makeRefreshToken();

    const saved = await saveRefreshToken(user.id, refreshToken);
    if (!saved) {
        throw new unauthorizedError("could not save refresh token");
    }


    respondWithJSON(res, 200, {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        email: user.email,
        token: accessToken,
        refreshToken: refreshToken,
        isChirpyRed: user.isChirpyRed,
    } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
    let refreshToken = getBearerToken(req);
    
    const result = await userForRefreshToken(refreshToken);

    if (!result) {
        throw new unauthorizedError("invalid refresh token");
    }

    const user = result.user;
    const accessToken = makeJWT(
        user.id,
        config.jwt.defaultDuration,
        config.jwt.secret,
    );

    type response = {
        token: string;
    };

    respondWithJSON(res, 200, {
        token: accessToken,
    } satisfies response);
}

export async function handlerRevoke(req: Request, res: Response) {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);
    res.status(204).send();
}