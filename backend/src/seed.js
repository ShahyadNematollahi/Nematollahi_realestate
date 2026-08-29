import { db } from "./db.js";

const properties = [
  {
    title: "Modern Villa with Infinity Pool",
    location: "Chalus, Kandovan Road",
    location_key: "north",
    type: "villa",
    status: "sale",
    price: 185,
    price_text: "185 Billion Tomans",
    beds: 5,
    baths: 4,
    area: 680,
    badge: "Featured",
    image: "/images/villa1.jpg",
    gallery: ["/images/villa1.jpg", "/images/interior1.jpg", "/images/villa5.jpg"],
    description:
      "A modern duplex villa with minimalist design and an infinity pool overlooking the forest. Features a smart home system, professional landscaping, covered parking for three cars, and 24-hour security. Exceptional location with excellent access to the main road.",
    featured: 1
  },
  {
    title: "Farmanieh Penthouse with 360° Views",
    location: "Tehran, Farmanieh",
    location_key: "farmanieh",
    type: "penthouse",
    status: "sale",
    price: 320,
    price_text: "320 Billion Tomans",
    beds: 4,
    baths: 5,
    area: 420,
    badge: "New",
    image: "/images/villa8.jpg",
    gallery: ["/images/villa8.jpg", "/images/interior2.jpg", "/images/villa3.jpg"],
    description:
      "Ultra-luxury penthouse on the top floor of a Farmanieh residential tower. Spacious terrace with panoramic views, Italian kitchen, professional sound system, and private elevator access. Ideal for living or long-term investment.",
    featured: 1
  },
  {
    title: "Classic Villa in Zaferanieh",
    location: "Tehran, Zaferanieh",
    location_key: "zaferanieh",
    type: "villa",
    status: "sale",
    price: 275,
    price_text: "275 Billion Tomans",
    beds: 6,
    baths: 5,
    area: 920,
    badge: "Featured",
    image: "/images/villa2.jpg",
    gallery: ["/images/villa2.jpg", "/images/villa4.jpg", "/images/interior1.jpg"],
    description:
      "Classic villa with distinctive architecture and a large courtyard. Features a grand reception hall, master bedrooms with private bathrooms, a full basement, and landscaped gardens designed by a landscape architect. One of the finest locations in Zaferanieh.",
    featured: 1
  },
  {
    title: "Luxury Apartment in Saadatabad",
    location: "Tehran, Saadatabad",
    location_key: "saadatabad",
    type: "apartment",
    status: "sale",
    price: 48,
    price_text: "48 Billion Tomans",
    beds: 3,
    baths: 2,
    area: 195,
    badge: "",
    image: "/images/apartment1.jpg",
    gallery: ["/images/apartment1.jpg", "/images/apartment2.jpg", "/images/interior2.jpg"],
    description:
      "Newly built apartment in a reputable Saadatabad residential tower. Excellent natural light, premium materials, elegant lobby, private pool and gym. Ready for immediate handover.",
    featured: 0
  },
  {
    title: "Modern Villa in Elahieh with Roof Garden",
    location: "Tehran, Elahieh",
    location_key: "elahieh",
    type: "villa",
    status: "sale",
    price: 410,
    price_text: "410 Billion Tomans",
    beds: 5,
    baths: 6,
    area: 780,
    badge: "Luxury",
    image: "/images/villa3.jpg",
    gallery: ["/images/villa3.jpg", "/images/villa6.jpg", "/images/interior1.jpg"],
    description:
      "Triplex villa with roof garden and outdoor pool. Interior design by leading architects, full smart home system, garage for four cars, and a rare location in the heart of Elahieh.",
    featured: 1
  },
  {
    title: "Seaside Villa in Ramsar",
    location: "Ramsar, Beachfront",
    location_key: "north",
    type: "villa",
    status: "sale",
    price: 95,
    price_text: "95 Billion Tomans",
    beds: 4,
    baths: 3,
    area: 450,
    badge: "Recommended",
    image: "/images/villa7.jpg",
    gallery: ["/images/villa7.jpg", "/images/villa5.jpg", "/images/villa1.jpg"],
    description:
      "Duplex beachfront villa with direct sea access. Modern design, private grounds, suitable for permanent residence or investment in northern properties.",
    featured: 1
  },
  {
    title: "Niavaran Penthouse",
    location: "Tehran, Niavaran",
    location_key: "niavaran",
    type: "penthouse",
    status: "sale",
    price: 245,
    price_text: "245 Billion Tomans",
    beds: 4,
    baths: 4,
    area: 380,
    badge: "",
    image: "/images/villa4.jpg",
    gallery: ["/images/villa4.jpg", "/images/villa8.jpg", "/images/interior2.jpg"],
    description:
      "Penthouse with mountain and city views in one of Niavaran’s finest towers. Large terrace, open-plan kitchen, central air conditioning, and full building amenities.",
    featured: 0
  },
  {
    title: "Duplex Apartment in Farmanieh",
    location: "Tehran, Farmanieh",
    location_key: "farmanieh",
    type: "apartment",
    status: "sale",
    price: 128,
    price_text: "128 Billion Tomans",
    beds: 4,
    baths: 3,
    area: 310,
    badge: "New",
    image: "/images/apartment2.jpg",
    gallery: ["/images/apartment2.jpg", "/images/apartment1.jpg", "/images/interior1.jpg"],
    description:
      "Newly built duplex with high ceilings and distinctive interior design. Ideal for larger families or anyone who values open, luxurious living spaces.",
    featured: 1
  }
];

const agents = [
  {
    name: "Arman Rezaei",
    role: "Northern Villas Sales Manager",
    phone: "+989121234567",
    whatsapp: "989121234567",
    email: "arman@nematollahiestates.com",
    photo: "/images/agent1.jpg"
  },
  {
    name: "Sara Mohammadi",
    role: "Tehran Penthouse Specialist",
    phone: "+989121234567",
    whatsapp: "989121234567",
    email: "sara@nematollahiestates.com",
    photo: "/images/agent2.jpg"
  },
  {
    name: "Kianoush Ahmadi",
    role: "Investment Advisor",
    phone: "+989121234567",
    whatsapp: "989121234567",
    email: "kianoush@nematollahiestates.com",
    photo: "/images/agent3.jpg"
  }
];

const settings = {
  name: "Nematollahi Estates",
  phone: "+98 21 2200 9876",
  mobile: "+98 912 123 4567",
  whatsapp: "989121234567",
  email: "hello@nematollahiestates.com",
  address: "Tehran, Elahieh, Fereshteh St., No. 28",
  yearsExperience: "14",
  dealsClosed: "950"
};

db.exec("BEGIN");
db.exec("DELETE FROM inquiries");
db.exec("DELETE FROM properties");
db.exec("DELETE FROM agents");
db.exec("DELETE FROM settings");

const insertProperty = db.prepare(`
  INSERT INTO properties (
    title, location, location_key, type, status, price, price_text,
    beds, baths, area, badge, image, gallery, description, featured
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const p of properties) {
  insertProperty.run(
    p.title,
    p.location,
    p.location_key,
    p.type,
    p.status,
    p.price,
    p.price_text,
    p.beds,
    p.baths,
    p.area,
    p.badge,
    p.image,
    JSON.stringify(p.gallery),
    p.description,
    p.featured
  );
}

const insertAgent = db.prepare(`
  INSERT INTO agents (name, role, phone, whatsapp, email, photo)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const a of agents) {
  insertAgent.run(a.name, a.role, a.phone, a.whatsapp, a.email, a.photo);
}

const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
for (const [key, value] of Object.entries(settings)) {
  insertSetting.run(key, String(value));
}

db.exec("COMMIT");
console.log(`Seeded ${properties.length} properties and ${agents.length} agents.`);
