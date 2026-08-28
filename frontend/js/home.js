document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [featured, stats, agents, agency] = await Promise.all([
      window.api.get("/api/properties?featured=1&limit=6"),
      window.api.get("/api/stats"),
      window.api.get("/api/agents"),
      window.api.get("/api/agency")
    ]);

    const grid = document.getElementById("propsGrid");
    if (grid) {
      const items = featured.items.length ? featured.items : (await window.api.get("/api/properties?limit=6")).items;
      grid.innerHTML = items.map(renderCard).join("");
      observeReveals();
    }

    const listings = document.getElementById("metricListings");
    const deals = document.getElementById("metricDeals");
    const years = document.getElementById("metricYears");
    if (listings) listings.textContent = `${stats.total}+`;
    if (deals) deals.textContent = `${agency.dealsClosed}+`;
    if (years) years.textContent = String(agency.yearsExperience);

    const setCount = (id, n) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${n} ${n === 1 ? "Property" : "Properties"}`;
    };
    setCount("countVilla", stats.byType.villa || 0);
    setCount("countPenthouse", stats.byType.penthouse || 0);
    setCount("countApartment", stats.byType.apartment || 0);
    setCount("countDuplex", stats.duplex || 0);

    const agentsGrid = document.getElementById("agentsGrid");
    if (agentsGrid && agents.items.length) {
      agentsGrid.innerHTML = agents.items.map((agent) => `
        <div class="agent reveal">
          <img src="${escapeHtml(mediaUrl(agent.photo))}" alt="${escapeHtml(agent.name)}" loading="lazy">
          <div class="agent-info">
            <h3>${escapeHtml(agent.name)}</h3>
            <div class="role">${escapeHtml(agent.role)}</div>
            <div class="agent-links">
              <a href="tel:${escapeHtml(agent.phone)}" title="Call">📞</a>
              <a href="https://wa.me/${escapeHtml(agent.whatsapp)}" title="WhatsApp">💬</a>
              <a href="mailto:${escapeHtml(agent.email)}" title="Email">✉️</a>
            </div>
          </div>
        </div>
      `).join("");
      observeReveals();
    }

    document.querySelectorAll("[data-agency-phone]").forEach((el) => {
      el.href = "tel:" + agency.mobile.replace(/\s/g, "");
    });
    document.querySelectorAll("[data-agency-wa]").forEach((el) => {
      el.href = "https://wa.me/" + agency.whatsapp;
    });
    document.querySelectorAll("[data-agency-email]").forEach((el) => {
      el.textContent = agency.email;
    });
    document.querySelectorAll("[data-agency-address]").forEach((el) => {
      el.textContent = agency.address;
    });
    document.querySelectorAll("[data-agency-phone-label]").forEach((el) => {
      el.textContent = agency.phone;
    });
    document.querySelectorAll("[data-agency-mobile-label]").forEach((el) => {
      el.textContent = agency.mobile;
    });
  } catch (err) {
    const grid = document.getElementById("propsGrid");
    if (grid) {
      grid.innerHTML = '<div class="empty-note">Listings are temporarily unavailable.</div>';
    }
    console.error(err);
  }

  bindInquiryForm(document.getElementById("inquiryForm"));
});
