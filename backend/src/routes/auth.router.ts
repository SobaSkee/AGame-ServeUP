import express from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { findUserId } from "../services/user.service";
import { createNewPantry } from "../services/pantry.service";
import { extractBearerOrCookieToken, revokeSessionToken, validateTokenCookie } from "../services/session.service";

const router = express.Router();

function authCookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: (prod ? "none" : "lax") as "none" | "lax",
    secure: prod,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(name, email, password);
    if (!result.acknowledged) throw new Error("Failed to register user");
    const user = await findUserId(result.insertedId);
    if (!user) throw new Error("Failed to find user data after registration");
    await createNewPantry(user._id);

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

    res.cookie("token", token, authCookieOptions());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = extractBearerOrCookieToken(req);
    const sessionInfo = await validateTokenCookie(token);

    if (!sessionInfo.valid || !sessionInfo.user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const user = await findUserId(sessionInfo.user);
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

router.post("/logout", async (req, res) => {
  const token = extractBearerOrCookieToken(req);
  await revokeSessionToken(token);
  res.clearCookie("token", { ...authCookieOptions(), maxAge: 0 });
  res.json({ message: "Logged out" });
});

export default router;