import { db } from "../index.js";
import { chirps , NewChirp, Chirp} from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
    const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
    return result;
}

export async function getAllChirps() {
    const result = await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
    return result;
}

export async function getChirpByID(chirpId: string) {
    const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
    return result;
}

export async function deleteChripByID(chripId: string) {
    const rows = await db
    .delete(chirps)
    .where(eq(chirps.id, chripId))
    .returning();
};

export async function getChirpByUserID(userID: string) {
    const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, userID));
    return result;
}