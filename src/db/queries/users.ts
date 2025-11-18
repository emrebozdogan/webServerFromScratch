import { db } from "../index.js";
import { NewUser, refreshTokens, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
    const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
    return result;
}

export async function deleteAllUsers() {
    await db.delete(users);
}

export async function findUserByEmail(email: string) {
    const [result] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
    return result;
}


export async function changeUserEmailAndPassword(email: string, hashedNewPassword: string, userID: string) {
    const rows = await db
    .update(users)
    .set({ email: email, hashedPassword: hashedNewPassword})
    .where(eq(users.id, userID))
    .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
    });

    return rows[0];
}

export async function upgradeUser(userID: string) {
    await db
    .update(users)
    .set({ isChirpyRed: true })
    .where(eq(users.id, userID))
    .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
    });
}