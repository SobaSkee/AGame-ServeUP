import { collections } from "./database.service.ts"
import { UpdateResult, InsertOneResult, WithId, ObjectId } from "mongodb"
import User from "../models/user.ts"

export async function userEmailExists(email: string) : Promise<boolean> {
	if (!collections.users) throw new Error("Users services are not available");
	const user = await collections.users.findOne({email: email});
	return user !== null;
}

export async function findUserEmail(email: string) : Promise<WithId<User> | null> {
    if (!collections.users) throw new Error("Users services are not available");
    return collections.users.findOne({email: email});
}

export async function findUserId(id: ObjectId) : Promise<WithId<User> | null> {
    if (!collections.users) throw new Error("Users services are not available");
    return collections.users.findOne({_id: id});
}

export async function createNewUser(name: string, unique_email: string, hashed_pwd: string) : Promise<InsertOneResult<User>> {
    if (!collections.users) throw new Error("Users services are not available");
    const new_user: User = {
        created_at: new Date(),
        last_login: null,
        name: name,
        email: unique_email,
        password: hashed_pwd,
    };

    // console.log("Running users insertion function...");
    return await collections.users.insertOne(new_user);
}

export async function updateLastLogin(id: ObjectId) : Promise<UpdateResult<User>> {
    if (!collections.users) throw new Error("Users services are not available");
    return await collections.users.updateOne({_id: id}, {$set: {last_login: new Date()}});
}