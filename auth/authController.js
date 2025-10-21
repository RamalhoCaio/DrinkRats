import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../prismaClient.js";
import { generateAccessToken } from "../utils/jwt.js";

const REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_DAYS) || 30;

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, username, email, passwordHash: hash },
    });

    res.status(201).json({ message: "Usuário criado com sucesso!", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas." });

    const accessToken = generateAccessToken(user);

    // Refresh token
    const refreshToken = generateRefreshToken();
    const refreshHash = await bcrypt.hash(refreshToken, 12);

    await prisma.token.create({
      data: {
        userId: user.id,
        type: "REFRESH",
        tokenHash: refreshHash,
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login." });
  }
};

export const refresh = async (req, res) => {
  try {
    const presented = req.cookies.refreshToken;
    if (!presented) return res.status(401).json({ error: "Token ausente." });

    const tokens = await prisma.token.findMany({
      where: { type: "REFRESH", revoked: false },
      include: { user: true },
    });

    let found = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(presented, t.tokenHash);
      if (match) {
        found = t;
        break;
      }
    }

    if (!found || found.expiresAt < new Date())
      return res.status(401).json({ error: "Refresh token inválido ou expirado." });

    // Rotaciona
    await prisma.token.update({ where: { id: found.id }, data: { revoked: true } });

    const newRefresh = generateRefreshToken();
    const newHash = await bcrypt.hash(newRefresh, 12);

    await prisma.token.create({
      data: {
        userId: found.userId,
        type: "REFRESH",
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    const newAccess = generateAccessToken(found.user);

    res.cookie("refreshToken", newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: REFRESH_DAYS * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao renovar token." });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const all = await prisma.token.findMany({ where: { revoked: false, type: "REFRESH" } });
      for (const t of all) {
        if (await bcrypt.compare(token, t.tokenHash)) {
          await prisma.token.update({ where: { id: t.id }, data: { revoked: true } });
        }
      }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logout efetuado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer logout." });
  }
};
