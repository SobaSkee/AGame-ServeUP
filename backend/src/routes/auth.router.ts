import express from "express";
import jwt from "jsonwebtoken";
import { registerUser, loginUser } from "../services/auth.service";
import { findUserId } from "../services/user.service";
import { ObjectId } from "mongodb";
import { validateSession } from "../services/session.service";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(name, email, password);
    if (!result.acknowledged) throw new Error("Failed to register user");
    const user = await findUserId(result.insertedId);
    if (!user) throw new Error("Failed to find user data after registration");

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) { return res.status(401).json({ message: "Not logged in" }); }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const decoded_user_id = new ObjectId(decoded.id);

    if (!(await validateSession(token, decoded_user_id))) return res.status(401).json({ message: "Invalid session" });

    const user = await findUserId(decoded_user_id);
    if (!user) { return res.status(404).json({ message: "User not found" }); }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;