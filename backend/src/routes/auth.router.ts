import express from "express";
import { registerUser, loginUser } from "../services/auth.service";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.json({
      id: user.id,
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
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;