import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user";

const users: User[] = []; // TEMP (no DB yet)

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existing = users.find((u) => u.email === email);
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user: User = {
    id: Date.now().toString(),
    name,
    email,
    password: hashed,
  };

  users.push(user);

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return { user, token };
};