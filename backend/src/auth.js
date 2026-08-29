import crypto from "node:crypto";

const tokens = new Map();

function getSecret() {
  return process.env.SESSION_SECRET || "dev-only-change-me";
}

export function issueToken() {
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, Date.now() + 1000 * 60 * 60 * 12);
  return token;
}

export function revokeToken(token) {
  tokens.delete(token);
}

export function isValidToken(token) {
  if (!token) return false;
  const expires = tokens.get(token);
  if (!expires) return false;
  if (Date.now() > expires) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!isValidToken(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left, Buffer.alloc(left.length));
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

export { getSecret };
