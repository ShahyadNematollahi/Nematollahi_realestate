function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function mediaUrl(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  return src.startsWith("/") ? src : "/" + src;
}

function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  });

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  if (burger && nav) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      burger.classList.remove("is-open");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      nav.classList.add("is-open");
      burger.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    burger.addEventListener("click", () => {
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) {
        closeMenu();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }
}

function observeReveals() {
  const els = document.querySelectorAll(".reveal:not(.is-in)");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
  els.forEach((el) => io.observe(el));
}

function renderCard(p) {
  const badge = p.badge ? `<span class="prop-tag">${escapeHtml(p.badge)}</span>` : "";
  return `
    <article class="prop reveal">
      <a href="property.html?id=${encodeURIComponent(p.id)}" style="display:block;color:inherit">
        <div class="prop-media">
          <img src="${escapeHtml(mediaUrl(p.image))}" alt="${escapeHtml(p.title)}" loading="lazy">
          ${badge}
        </div>
        <div class="prop-body">
          <div class="prop-price">${escapeHtml(p.priceText)}</div>
          <h3 class="prop-name">${escapeHtml(p.title)}</h3>
          <div class="prop-loc"><span>📍</span><span>${escapeHtml(p.location)}</span></div>
          <div class="prop-meta">
            <span><strong>${escapeHtml(p.beds)}</strong> Beds</span>
            <span><strong>${escapeHtml(p.baths)}</strong> Baths</span>
            <span><strong>${escapeHtml(p.area)}</strong> m²</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

function typeLabel(type) {
  if (type === "villa") return "Villa";
  if (type === "penthouse") return "Penthouse";
  return "Apartment";
}

async function bindInquiryForm(form) {
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email ? form.email.value.trim() : "",
      message: form.message.value.trim(),
      propertyId: form.propertyId ? Number(form.propertyId.value) || undefined : undefined
    };
    if (status) status.textContent = "Sending…";
    try {
      await window.api.post("/api/inquiries", payload);
      form.reset();
      if (status) status.textContent = "Request received. An advisor will contact you shortly.";
    } catch (err) {
      if (status) status.textContent = err.message || "Could not send the request.";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  observeReveals();
});
