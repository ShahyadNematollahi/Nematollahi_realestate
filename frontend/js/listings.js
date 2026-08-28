async function applyFilters() {
  const loc = document.getElementById("fLoc").value;
  const type = document.getElementById("fType").value;
  const min = document.getElementById("fMin").value;
  const max = document.getElementById("fMax").value;
  const params = new URLSearchParams();
  if (loc) params.set("loc", loc);
  if (type) params.set("type", type);
  if (min) params.set("min", min);
  if (max) params.set("max", max);
  params.set("limit", "48");

  const grid = document.getElementById("propsGrid");
  const count = document.getElementById("resultCount");
  grid.innerHTML = '<div class="empty-note">Loading listings…</div>';

  try {
    const data = await window.api.get("/api/properties?" + params.toString());
    grid.innerHTML = data.items.length
      ? data.items.map(renderCard).join("")
      : '<div class="empty-note">No properties match these criteria</div>';
    count.textContent = data.items.length
      ? `${data.total} propert${data.total === 1 ? "y" : "ies"} found`
      : "";
    const next = new URL(window.location.href);
    ["loc", "type", "min", "max"].forEach((key) => {
      const value = params.get(key);
      if (value) next.searchParams.set(key, value);
      else next.searchParams.delete(key);
    });
    history.replaceState({}, "", next);
    observeReveals();
  } catch (err) {
    grid.innerHTML = '<div class="empty-note">Listings are temporarily unavailable.</div>';
    count.textContent = "";
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("loc")) document.getElementById("fLoc").value = params.get("loc");
  if (params.get("type")) document.getElementById("fType").value = params.get("type");
  if (params.get("min")) document.getElementById("fMin").value = params.get("min");
  if (params.get("max")) document.getElementById("fMax").value = params.get("max");
  applyFilters();
  document.getElementById("filterBtn").addEventListener("click", applyFilters);
});
