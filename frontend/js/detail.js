function swapImg(el, src) {
  document.getElementById("mainImg").src = src;
  document.querySelectorAll(".detail-gallery .thumb").forEach((t) => t.classList.remove("is-active"));
  el.classList.add("is-active");
}

window.swapImg = swapImg;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number.parseInt(params.get("id"), 10);
  const root = document.getElementById("detailRoot");

  if (!id) {
    root.innerHTML = '<div class="empty-note">Property not found.</div>';
    return;
  }

  try {
    const p = await window.api.get("/api/properties/" + id);
    const agency = await window.api.get("/api/agency");
    document.title = p.title + " | Nematollahi Estates";
    document.getElementById("bcTitle").textContent = p.title;

    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
    const thumbs = gallery.map((src, index) => `
      <div class="thumb${index === 0 ? " is-active" : ""}" onclick="swapImg(this, '${escapeHtml(mediaUrl(src))}')">
        <img src="${escapeHtml(mediaUrl(src))}" alt="">
      </div>
    `).join("");

    const waText = encodeURIComponent("Hi, I would like more information about " + p.title);

    root.innerHTML = `
      <div class="detail-gallery">
        <div class="main"><img src="${escapeHtml(mediaUrl(gallery[0]))}" alt="${escapeHtml(p.title)}" id="mainImg"></div>
        ${thumbs}
      </div>
      <div class="detail-side">
        <div class="price">${escapeHtml(p.priceText)}</div>
        <h1>${escapeHtml(p.title)}</h1>
        <div class="loc"><span>📍</span> ${escapeHtml(p.location)}</div>
        <div class="detail-meta">
          <div><strong>${escapeHtml(p.beds)}</strong>Bedrooms</div>
          <div><strong>${escapeHtml(p.baths)}</strong>Bathrooms</div>
          <div><strong>${escapeHtml(p.area)}</strong>m²</div>
          <div><strong>${escapeHtml(typeLabel(p.type))}</strong>Type</div>
        </div>
        <p class="detail-desc">${escapeHtml(p.desc)}</p>
        <div class="detail-actions">
          <a href="https://wa.me/${escapeHtml(agency.whatsapp)}?text=${waText}" target="_blank" class="btn btn-gold">Request a Viewing</a>
          <a href="tel:${escapeHtml(agency.mobile.replace(/\s/g, ""))}" class="btn btn-line">Call an Advisor</a>
        </div>
        <form class="inquiry-form" id="inquiryForm">
          <input type="hidden" name="propertyId" value="${escapeHtml(p.id)}">
          <div class="form-row">
            <input name="name" required placeholder="Full name">
            <input name="phone" required placeholder="Phone">
          </div>
          <input name="email" type="email" placeholder="Email (optional)">
          <textarea name="message" required rows="4" placeholder="Tell us what you are looking for"></textarea>
          <button type="submit" class="btn btn-gold">Send request</button>
          <p class="form-status" data-form-status></p>
        </form>
      </div>
    `;
    bindInquiryForm(document.getElementById("inquiryForm"));
  } catch (err) {
    root.innerHTML = '<div class="empty-note">This listing is no longer available.</div>';
    document.getElementById("bcTitle").textContent = "Not found";
    console.error(err);
  }
});
