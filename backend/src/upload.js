import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

function sniffType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (buf.length >= 6 && buf.toString("ascii", 0, 3) === "GIF") return "image/gif";
  return "";
}

function headerValue(headers, name) {
  const lower = name.toLowerCase();
  const line = headers.split("\r\n").find((row) => row.toLowerCase().startsWith(lower + ":"));
  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function parseDisposition(value) {
  const out = {};
  for (const part of value.split(";")) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rest.length) continue;
    out[rawKey.toLowerCase()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
  return out;
}

export function parseMultipart(buffer, contentType) {
  const match = String(contentType || "").match(/boundary=([^;]+)/i);
  if (!match) throw Object.assign(new Error("Missing multipart boundary"), { status: 400 });
  const boundary = match[1].trim().replace(/^"|"$/g, "");
  const token = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = buffer.indexOf(token);
  while (start !== -1) {
    const after = start + token.length;
    if (buffer.slice(after, after + 2).toString() === "--") break;
    const headerStart = after + (buffer.slice(after, after + 2).toString() === "\r\n" ? 2 : 0);
    const headerEnd = buffer.indexOf("\r\n\r\n", headerStart);
    if (headerEnd === -1) break;
    const headers = buffer.slice(headerStart, headerEnd).toString("utf8");
    const next = buffer.indexOf(token, headerEnd + 4);
    if (next === -1) break;
    let bodyEnd = next - 2;
    if (buffer.slice(bodyEnd, next).toString() !== "\r\n") bodyEnd = next;
    parts.push({
      headers,
      data: buffer.slice(headerEnd + 4, bodyEnd)
    });
    start = next;
  }
  return parts;
}

export function saveUploadedImages(buffer, contentType, { maxFiles = 12, maxBytes = 8_000_000 } = {}) {
  const parts = parseMultipart(buffer, contentType);
  const saved = [];
  for (const part of parts) {
    const disposition = headerValue(part.headers, "content-disposition");
    const meta = parseDisposition(disposition);
    if (!meta.filename) continue;
    if (part.data.length > maxBytes) {
      throw Object.assign(new Error("Each image must be under 8MB"), { status: 413 });
    }
    const type = sniffType(part.data) || headerValue(part.headers, "content-type").split(";")[0].trim();
    if (!ALLOWED.has(type)) {
      throw Object.assign(new Error("Only JPG, PNG, WEBP and GIF images are allowed"), { status: 400 });
    }
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${EXT[type]}`;
    fs.writeFileSync(path.join(uploadsDir, name), part.data);
    saved.push(`/uploads/${name}`);
    if (saved.length >= maxFiles) break;
  }
  if (!saved.length) {
    throw Object.assign(new Error("No valid images were uploaded"), { status: 400 });
  }
  return saved;
}

export function isUploadPath(filePath) {
  return String(filePath || "").startsWith("/uploads/");
}
