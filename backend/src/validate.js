const TYPES = new Set(["villa", "penthouse", "apartment"]);
const STATUSES = new Set(["sale", "rent", "sold"]);
const LOCATION_KEYS = new Set([
  "saadatabad",
  "farmanieh",
  "niavaran",
  "elahieh",
  "zaferanieh",
  "north"
]);

export function asInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function asFloat(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : fallback;
}

export function cleanText(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function formatPriceText(price) {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) return "";
  const n = Number(price);
  const label = Number.isInteger(n) ? String(n) : String(n);
  return `${label} Billion Tomans`;
}

export function normalizeImagePath(value) {
  const raw = cleanText(value, 300);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function validatePropertyPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  const assign = (key, value, required) => {
    if (value === undefined) {
      if (!partial && required) errors.push(`${key} is required`);
      return;
    }
    data[key] = value;
  };

  if (body.title !== undefined || !partial) {
    const title = cleanText(body.title, 160);
    if (!title) errors.push("title is required");
    assign("title", title, true);
  }

  if (body.location !== undefined || !partial) {
    const location = cleanText(body.location, 160);
    if (!location) errors.push("location is required");
    assign("location", location, true);
  }

  if (body.locationKey !== undefined || !partial) {
    const locationKey = cleanText(body.locationKey, 40).toLowerCase();
    if (!LOCATION_KEYS.has(locationKey)) errors.push("locationKey is invalid");
    assign("location_key", locationKey, true);
  }

  if (body.type !== undefined || !partial) {
    const type = cleanText(body.type, 40).toLowerCase();
    if (!TYPES.has(type)) errors.push("type is invalid");
    assign("type", type, true);
  }

  if (body.status !== undefined || !partial) {
    const status = cleanText(body.status || "sale", 20).toLowerCase();
    if (!STATUSES.has(status)) errors.push("status is invalid");
    assign("status", status, true);
  }

  if (body.price !== undefined || !partial) {
    const price = asFloat(body.price);
    if (price === null || price < 0) errors.push("price is invalid");
    assign("price", price, true);
  }

  if (body.priceText !== undefined || body.price !== undefined || !partial) {
    const priceText = cleanText(body.priceText, 80) || formatPriceText(asFloat(body.price));
    if (!priceText) errors.push("priceText is required");
    assign("price_text", priceText, true);
  }

  for (const field of ["beds", "baths", "area"]) {
    if (body[field] !== undefined || !partial) {
      const n = asInt(body[field]);
      if (n === null || n < 0) errors.push(`${field} is invalid`);
      assign(field, n, true);
    }
  }

  if (body.badge !== undefined) assign("badge", cleanText(body.badge, 40), false);

  if (body.image !== undefined || !partial) {
    const image = normalizeImagePath(body.image);
    if (!image) errors.push("image is required");
    assign("image", image, true);
  }

  if (body.gallery !== undefined || body.image !== undefined || !partial) {
    const incoming = Array.isArray(body.gallery)
      ? body.gallery.map((x) => normalizeImagePath(x)).filter(Boolean)
      : [];
    const cover = normalizeImagePath(body.image);
    const gallery = cover && !incoming.includes(cover) ? [cover, ...incoming] : incoming;
    assign("gallery", JSON.stringify(gallery), true);
  }

  if (body.desc !== undefined || body.description !== undefined || !partial) {
    assign("description", cleanText(body.desc || body.description, 4000), true);
  }

  if (body.featured !== undefined) {
    assign("featured", body.featured ? 1 : 0, false);
  }

  return { errors, data };
}

export function validateAgentPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};
  const fields = [
    ["name", 80, true],
    ["role", 120, true],
    ["phone", 40, true],
    ["whatsapp", 40, true],
    ["email", 120, true],
    ["photo", 300, true]
  ];
  for (const [key, max, required] of fields) {
    if (body[key] === undefined) {
      if (!partial && required) errors.push(`${key} is required`);
      continue;
    }
    const value = key === "photo" ? normalizeImagePath(body[key]) : cleanText(body[key], max);
    if (required && !value) errors.push(`${key} is required`);
    data[key] = value;
  }
  return { errors, data };
}

export function validateSettingsPayload(body) {
  const allowed = new Set([
    "name",
    "phone",
    "mobile",
    "whatsapp",
    "email",
    "address",
    "yearsExperience",
    "dealsClosed"
  ]);
  const data = {};
  for (const [key, value] of Object.entries(body || {})) {
    if (!allowed.has(key)) continue;
    data[key] = cleanText(value, 200);
  }
  return data;
}

export { TYPES, STATUSES, LOCATION_KEYS };
