import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRES = "15m";

export function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}