import type { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { badRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new badRequestError("Missing required fields");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}