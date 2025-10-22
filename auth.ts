import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "./generated/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = express.Router();

const SECRET_KEY = "sua_chave_super_secreta"; // idealmente via variável de ambiente (.env)

/* ============================
   REGISTER (signup)
============================ */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, username, email, password: hashedPassword },
    });

    res.json({ message: "Usuário criado com sucesso!", user });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

/* ============================
   LOGIN (signin)
============================ */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

    await prisma.token.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // expira em 1h
      },
    });

    res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

/* ============================
   Middleware: Verificar Token
============================ */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token não fornecido" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    req.user = user; // ✅ agora é aceito sem erro
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

export default router;
