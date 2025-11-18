import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { Request } from "express";
import { unauthorizedError } from "./api/errors.js";
import crypto from "crypto";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new unauthorizedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new unauthorizedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new unauthorizedError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new unauthorizedError("No authorization header");
  const token = authHeader.split(" ")[1];
  if (!token) throw new unauthorizedError("No token provided");
  return token;
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function getAPIKey(req: Request) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new unauthorizedError("No authorization header");
  const api_key = authHeader?.split(" ")[1];
  if (!api_key) throw new unauthorizedError("wrong api key");
  return api_key;
}