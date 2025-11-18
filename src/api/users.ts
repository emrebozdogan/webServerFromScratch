import type { Request, Response } from "express";
import { changeUserEmailAndPassword, createUser } from "../db/queries/users.js";
import { badRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { userForRefreshToken } from "../db/queries/refresh.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new badRequestError("Missing required fields");
  }
  if (typeof params.password !== "string" ) {
    throw new Error("not string");  
  }
  const hPassword = await hashPassword(params.password);
  const user = await createUser({
     email: params.email,
     hashedPassword: hPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }
  
  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUsersChangeInfos(req: Request, res: Response) {
  type parameters = {
    email: string,
    password: string,
  };

  const token = getBearerToken(req);
  const userID = validateJWT(token, config.jwt.secret)
  const params: parameters = req.body;
  const userNewPassword = params.password;
  const userNewEmail = params.email;

  if (!userNewEmail || !userNewPassword) {
    throw new Error("email or password missing");
  }

  const hashedNewPassword = await hashPassword(userNewPassword);
  const updated = await changeUserEmailAndPassword(userNewEmail, hashedNewPassword, userID);
  
  respondWithJSON(res, 200, updated);
}