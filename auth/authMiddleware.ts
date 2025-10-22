import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "sua_chave_super_secreta";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token não fornecido" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    (req as any).user = user; // anexa usuário à requisição
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
