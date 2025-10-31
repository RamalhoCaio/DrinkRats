import express, { Request, Response } from "express";
import { PrismaClient } from "./generated/prisma";
import bodyParser from "body-parser";

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

/* ============================
   USER CRUD
============================ */

// CREATE
app.post("/users", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// READ ALL
app.get("/users", async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.json(users);
});

// READ ONE
app.get("/users/:id", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { posts: true },
  });
  res.json(user);
});

// UPDATE
app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// DELETE
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

/* ============================
   DRINK CRUD
============================ */

app.post("/drinks", async (req: Request, res: Response) => {
  const drink = await prisma.drink.create({ data: req.body });
  res.json(drink);
});

app.get("/drinks", async (_req: Request, res: Response) => {
  const drinks = await prisma.drink.findMany({ include: {
posts: true } });
  res.json(drinks);
});

app.get("/drinks/:id", async (req: Request, res: Response) => {
  const drink = await prisma.drink.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(drink);
});

app.delete("/drinks/:id", async (req: Request, res: Response) => { 
  await prisma.drink.delete({ where: { id: req.params.id } }); 
  res.json({ message: "Drink deleted" }); 
});


/* ============================
   POST CRUD
============================ */

app.post("/posts", async (req: Request, res: Response) => {
  try {
    const post = await prisma.post.create({ data: req.body });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

app.get("/posts", async (_req: Request, res: Response) => {
  const posts = await prisma.post.findMany({ include: { user: true, drink: true } });
  res.json(posts);
});

app.get("/posts/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { user: true, drink: true },
  });
  res.json(post);
});

app.put("/posts/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(post);
});

app.delete("/posts/:id", async (req: Request, res: Response) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ message: "Post deleted" });
});

/* ============================
   SERVER START
============================ */

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});