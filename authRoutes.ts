import express from "express";
import { login, register } from "../auth/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;