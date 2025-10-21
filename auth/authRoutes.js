import express from "express";
import cookieParser from "cookie-parser";
import { signup, login, refresh, logout } from "./authController.js";
import { authMiddleware } from "./authMiddleware.js";

const router = express.Router();

router.use(cookieParser());

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Exemplo de rota protegida
router.get("/me", authMiddleware, async (req, res) => {
  res.json({ message: "Você está autenticado!", userId: req.user.id });
});

export default router;
