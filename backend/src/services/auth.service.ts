import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user";
import { collections } from "./database.service.ts"
import { WithId, InsertOneResult } from "mongodb"
import { userEmailExists, findUserEmail, createNewUser } from "./user.service.ts";
import { sessionTokenExists, createNewSession } from "./session.service.ts";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (name: string, email: string, password: string) : Promise<InsertOneResult<User>>  => {
  if (!collections.users) throw new Error("Users services are not available");
  if (await userEmailExists(email)) throw new Error("User with that email already exists");

  const hashed_pwd = await bcrypt.hash(password, 10);
  return createNewUser(name, email, hashed_pwd);
};

export const loginUser = async (email: string, password: string) : Promise<{user: WithId<User>, token: string}> => {
  const user = await findUserEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  var token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "7d", });
  const result = await createNewSession(token, user._id); // Will create new session if one with this signature does not already exist, or will update it if it does
  if (!result.acknowledged) throw new Error("Failed to generate session token");

  return { user, token };
};