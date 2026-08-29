const tokenKey = "ne_admin_token";

function authHeaders() {
  return { Authorization: "Bearer " + (localStorage.getItem(tokenKey) || "") };
}

function showPanel(authed) {
  document.getElementById("loginPanel").hidden = authed;
  document.getElementById("deskPanel").hidden = !authed;
}

async function loadDesk() {
  const [props, inquiries] = await Promise.all([
    window.api.get("/api/properties?limit=100"),
    window.api.get("/api/admin/inquiries", authHeaders()).catch(() => null)
  ]);

  const list = document.getElementById("adminList");
  list.innerHTML = props.items.map((p) => `
    <article class="admin-row">
      <div>
        <strong>${escapeHtml(p.title)}</strong>
        <span>${escapeHtml(p.location)} · ${escapeHtml(p.priceText)}</span>
      </div>
      <button data-del="${p.id}" class="btn btn-line btn-sm">Remove</button>
    </article>
  `).join("");

  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this listing?")) return;
      await window.api.del("/api/admin/properties/" + btn.dataset.del, authHeaders());
      await loadDesk();
    });
  });

  const box = document.getElementById("inquiryList");
  if (!inquiries) {
    showPanel(false);
    return;
  }
  box.innerHTML = inquiries.items.length
    ? inquiries.items.map((item) => `
        <article class="admin-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${escapeHtml(item.phone)}${item.propertyTitle ? " · " + escapeHtml(item.propertyTitle) : ""}</span>
            <p>${escapeHtml(item.message)}</p>
          </div>
        </article>
      `).join("")
    : '<p class="empty-note">No inquiries yet.</p>';
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem(tokenKey);
  if (token) {
    try {
      showPanel(true);
      await loadDesk();
    } catch {
      localStorage.removeItem(tokenKey);
      showPanel(false);
    }
  }

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = document.querySelector("#loginForm [data-form-status]");
    try {
      const result = await window.api.post("/api/admin/login", {
        password: document.getElementById("adminPassword").value
      });
      localStorage.setItem(tokenKey, result.token);
      showPanel(true);
      await loadDesk();
    } catch {
      status.textContent = "Invalid password.";
    }
  });

  document.getElementById("createForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-form-status]");
    const payload = {
      title: form.title.value,
      location: form.location.value,
      locationKey: form.locationKey.value,
      type: form.type.value,
      status: "sale",
      price: Number(form.price.value),
      priceText: form.priceText.value,
      beds: Number(form.beds.value),
      baths: Number(form.baths.value),
      area: Number(form.area.value),
      badge: form.badge.value,
      image: form.image.value,
      gallery: form.image.value ? [form.image.value] : [],
      desc: form.desc.value,
      featured: form.featured.checked
    };
    try {
      await window.api.post("/api/admin/properties", payload, authHeaders());
      form.reset();
      status.textContent = "Listing published.";
      await loadDesk();
    } catch (err) {
      status.textContent = err.message || "Could not publish listing.";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(tokenKey);
    showPanel(false);
  });
});
