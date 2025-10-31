import express from "express";
import bodyParser from "body-parser";
import authRoutes from "../auth/authRoutes";
import { authenticate } from "../auth/authMiddleware";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());

// rotas públicas
app.use("/auth", authRoutes);

// rotas protegidas
app.get("/users", authenticate, async (_req, res) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.json(users);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
