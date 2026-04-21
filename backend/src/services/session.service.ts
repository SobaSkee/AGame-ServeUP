import { collections } from "./database.service.ts"
import { InsertOneResult, WithId, ObjectId } from "mongodb"
import Session from "../models/session.ts"
import crypto from "crypto"
import jwt from "jsonwebtoken";

const ONE_WEEK_MS = 604800000;

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function hashRawToken(raw_token: string) : string {
    return crypto.createHash('sha256').update(raw_token).digest('hex');
}

export async function sessionTokenExists(token: string) : Promise<boolean> {
    if (!collections.sessions) throw new Error("Session services are not available");
    const token_hash = hashRawToken(token);
    const session = await collections.sessions.findOne({token: token_hash});
    return session !== null;
}

export async function validateSession(token: string, user_id: ObjectId) : Promise<boolean> {
    if (!collections.sessions) throw new Error("Session services are not available");
    const token_hash = hashRawToken(token);

    const session = await collections.sessions.findOne({token: token_hash});

    if (session === null) return false;

    return session.user_id.equals(user_id);
}

export async function createNewSession(token: string, user_id: ObjectId) : Promise<InsertOneResult<Session>> {
    if (!collections.sessions) throw new Error("Session services are not available");
    const token_hash = hashRawToken(token);
    const new_session: Session = {
        created_at: new Date(),
        expiration: new Date(Date.now() + ONE_WEEK_MS),
        token: token_hash,
        user_id: user_id
    };
    return await collections.sessions.insertOne(new_session);
}

export async function validateTokenCookie(token: string) : Promise<{valid: boolean, user: ObjectId | null}> {
    if (!token) return {valid: false, user: null};
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const decoded_user_id = new ObjectId(decoded.id);
        return {valid: await validateSession(token, decoded_user_id), user: decoded_user_id};
    } catch {
        return {valid: false, user: null};
    }
}