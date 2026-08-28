import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, mapProperty } from "./db.js";
import { issueToken, isValidToken, timingSafeEqual } from "./auth.js";
import { asFloat, asInt, cleanText, validatePropertyPayload } from "./validate.js";
import { applyCors, contentType, readBody, sendJson } from "./http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..", "..");
const frontendDir = path.join(rootDir, "frontend");
const envPath = path.join(rootDir, ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const count = db.prepare("SELECT COUNT(*) AS n FROM properties").get().n;
if (count === 0) {
  await import("./seed.js");
}

function urlOf(req) {
  return new URL(req.url, "http://127.0.0.1");
}

function tokenFrom(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function requireAdmin(req, res) {
  if (isValidToken(tokenFrom(req))) return true;
  sendJson(res, 401, { error: "Unauthorized" });
  return false;
}

function listProperties(search) {
  const loc = cleanText(search.get("loc"), 40).toLowerCase();
  const type = cleanText(search.get("type"), 40).toLowerCase();
  const status = cleanText(search.get("status"), 20).toLowerCase();
  const min = asFloat(search.get("min"), 0);
  const maxRaw = search.get("max");
  const max = asFloat(maxRaw, Number.POSITIVE_INFINITY);
  const featured = search.get("featured");
  const limit = Math.min(asInt(search.get("limit"), 24) ?? 24, 100);
  const page = Math.max(asInt(search.get("page"), 1) ?? 1, 1);
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];
  if (loc) {
    where.push("location_key = ?");
    params.push(loc);
  }
  if (type) {
    where.push("type = ?");
    params.push(type);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (min) {
    where.push("price >= ?");
    params.push(min);
  }
  if (maxRaw && Number.isFinite(max)) {
    where.push("price <= ?");
    params.push(max);
  }
  if (featured === "1" || featured === "true") where.push("featured = 1");

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = db.prepare(`SELECT COUNT(*) AS n FROM properties ${clause}`).get(...params).n;
  const rows = db
    .prepare(`SELECT * FROM properties ${clause} ORDER BY featured DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  return { items: rows.map(mapProperty), total, page, limit };
}

async function handleApi(req, res, url) {
  const method = req.method;
  const route = url.pathname.replace(/\/$/, "") || "/";

  if (route === "/api/health" && method === "GET") {
    return sendJson(res, 200, { ok: true });
  }

  if (route === "/api/agency" && method === "GET") {
    const rows = db.prepare("SELECT key, value FROM settings").all();
    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return sendJson(res, 200, {
      name: settings.name || "Nematollahi Estates",
      phone: settings.phone || "",
      mobile: settings.mobile || "",
      whatsapp: settings.whatsapp || "",
      email: settings.email || "",
      address: settings.address || "",
      yearsExperience: asInt(settings.yearsExperience, 0),
      dealsClosed: asInt(settings.dealsClosed, 0)
    });
  }

  if (route === "/api/stats" && method === "GET") {
    const total = db.prepare("SELECT COUNT(*) AS n FROM properties").get().n;
    const featured = db.prepare("SELECT COUNT(*) AS n FROM properties WHERE featured = 1").get().n;
    const types = db.prepare("SELECT type, COUNT(*) AS n FROM properties GROUP BY type").all();
    const duplex = db.prepare(
      `SELECT COUNT(*) AS n FROM properties
       WHERE title LIKE '%Duplex%' OR title LIKE '%Triplex%'
          OR description LIKE '%duplex%' OR description LIKE '%triplex%'`
    ).get().n;
    const byType = { villa: 0, penthouse: 0, apartment: 0 };
    for (const row of types) byType[row.type] = row.n;
    return sendJson(res, 200, { total, featured, byType, duplex });
  }

  if (route === "/api/agents" && method === "GET") {
    const items = db.prepare("SELECT id, name, role, phone, whatsapp, email, photo FROM agents ORDER BY id").all();
    return sendJson(res, 200, { items });
  }

  if (route === "/api/properties" && method === "GET") {
    return sendJson(res, 200, listProperties(url.searchParams));
  }

  const propertyMatch = route.match(/^\/api\/properties\/(\d+)$/);
  if (propertyMatch && method === "GET") {
    const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(propertyMatch[1]));
    if (!row) return sendJson(res, 404, { error: "Property not found" });
    return sendJson(res, 200, mapProperty(row));
  }

  if (route === "/api/inquiries" && method === "POST") {
    const body = await readBody(req);
    const name = cleanText(body.name, 80);
    const phone = cleanText(body.phone, 40);
    const email = cleanText(body.email, 120);
    const message = cleanText(body.message, 2000);
    const propertyId = asInt(body.propertyId);
    if (!name) return sendJson(res, 400, { error: "name is required" });
    if (!phone) return sendJson(res, 400, { error: "phone is required" });
    if (!message) return sendJson(res, 400, { error: "message is required" });
    if (propertyId) {
      const exists = db.prepare("SELECT id FROM properties WHERE id = ?").get(propertyId);
      if (!exists) return sendJson(res, 404, { error: "Property not found" });
    }
    const result = db.prepare(
      "INSERT INTO inquiries (name, phone, email, property_id, message) VALUES (?, ?, ?, ?, ?)"
    ).run(name, phone, email, propertyId, message);
    return sendJson(res, 201, { ok: true, id: Number(result.lastInsertRowid) });
  }

  if (route === "/api/admin/login" && method === "POST") {
    const body = await readBody(req);
    const expected = process.env.ADMIN_PASSWORD || "change-me";
    if (!timingSafeEqual(String(body.password || ""), expected)) {
      return sendJson(res, 401, { error: "Invalid credentials" });
    }
    return sendJson(res, 200, { token: issueToken() });
  }

  if (route === "/api/admin/inquiries" && method === "GET") {
    if (!requireAdmin(req, res)) return;
    const items = db.prepare(`
      SELECT i.id, i.name, i.phone, i.email, i.message, i.created_at AS createdAt,
             i.property_id AS propertyId, p.title AS propertyTitle
      FROM inquiries i
      LEFT JOIN properties p ON p.id = i.property_id
      ORDER BY i.id DESC
      LIMIT 200
    `).all();
    return sendJson(res, 200, { items });
  }

  if (route === "/api/admin/properties" && method === "POST") {
    if (!requireAdmin(req, res)) return;
    const body = await readBody(req);
    const { errors, data } = validatePropertyPayload(body);
    if (errors.length) return sendJson(res, 400, { error: errors.join(", ") });
    const result = db.prepare(`
      INSERT INTO properties (
        title, location, location_key, type, status, price, price_text,
        beds, baths, area, badge, image, gallery, description, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title,
      data.location,
      data.location_key,
      data.type,
      data.status,
      data.price,
      data.price_text,
      data.beds,
      data.baths,
      data.area,
      data.badge || "",
      data.image,
      data.gallery,
      data.description || "",
      data.featured ?? 0
    );
    const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(result.lastInsertRowid));
    return sendJson(res, 201, mapProperty(row));
  }

  const adminProperty = route.match(/^\/api\/admin\/properties\/(\d+)$/);
  if (adminProperty && method === "PATCH") {
    if (!requireAdmin(req, res)) return;
    const id = Number(adminProperty[1]);
    const current = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
    if (!current) return sendJson(res, 404, { error: "Property not found" });
    const body = await readBody(req);
    const { errors, data } = validatePropertyPayload(body, { partial: true });
    if (errors.length) return sendJson(res, 400, { error: errors.join(", ") });
    const keys = Object.keys(data);
    if (!keys.length) return sendJson(res, 400, { error: "No fields to update" });
    const assignments = keys.map((key) => `${key} = ?`).join(", ");
    db.prepare(`UPDATE properties SET ${assignments} WHERE id = ?`).run(...keys.map((key) => data[key]), id);
    const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(id);
    return sendJson(res, 200, mapProperty(row));
  }

  if (adminProperty && method === "DELETE") {
    if (!requireAdmin(req, res)) return;
    const result = db.prepare("DELETE FROM properties WHERE id = ?").run(Number(adminProperty[1]));
    if (!result.changes) return sendJson(res, 404, { error: "Property not found" });
    return sendJson(res, 200, { ok: true });
  }

  return sendJson(res, 404, { error: "Not found" });
}

function safeJoin(root, requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const target = path.normalize(path.join(root, decoded));
  if (!target.startsWith(root)) return null;
  return target;
}

function serveStatic(req, res, url) {
  let relative = url.pathname === "/" ? "/index.html" : url.pathname;
  let filePath = safeJoin(frontendDir, relative);
  if (!filePath) {
    res.writeHead(400);
    res.end();
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const body = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": contentType(filePath), "Content-Length": body.length });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  try {
    const url = urlOf(req);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(req, res, url);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    if (!res.headersSent) sendJson(res, status, { error: err.message || "Internal server error" });
  }
});

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "127.0.0.1";
server.listen(port, host, () => {
  console.log(`Nematollahi Estates listening on http://${host}:${port}`);
});
