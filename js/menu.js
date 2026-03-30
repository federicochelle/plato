const MENU_API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMXoXxoHpxNuh90UlgUPF6FwEQ0JGww3_tX4S4TapCysrlb4Uz3gBUB9oz5DgqFU5c8ysg836iP7aW_aRYr2C073_wdxnjWLJrSuYUJmRC5RqjW5Aqe0OYLZy3PbG4czBiiMJ_BkYChjLKTyjHxs2aFsO249YK1op7h-vwe2q-ojyrD4WgaPk9ZUHo9y3T-ZXZkLB340bJ8jojFC9NJT7EQJFS7oZRQysJER3AFlQEAKZgzy4DTUYmVJdKL2XQLYbrVAlKJXs8zU-9FvH91S4NlYV3-pHw&lib=MqgZhj5zhhmIJ-EpNDB63jqsBj-ld1thL";

function stripTags(text) {
  return safeText(text).replace(/<[^>]*>/g, "");
}

function safeText(v) {
  return String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function paintWeeklySpecial({ nombre, descripcion }) {
  const box = document.getElementById("weekly-special");
  const elName = document.getElementById("weekly-special-name");
  const elDesc = document.getElementById("weekly-special-desc");

  if (!box) return;

  if (elName) elName.textContent = nombre || "";
  if (elDesc) elDesc.textContent = descripcion || "";

  box.hidden = false;
}

function hideWeeklySpecial() {
  const box = document.getElementById("weekly-special");
  if (box) box.hidden = true;
}

function showMenuSection() {
  const section = document.getElementById("menu");
  if (section) section.hidden = false;
}

function hideMenuSection() {
  const section = document.getElementById("menu");
  if (section) section.hidden = true;
}

function startOfLocalDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseSheetDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return startOfLocalDay(value);
  }

  const text = safeText(value);
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const uyMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (uyMatch) {
    const [, day, month, year] = uyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  return startOfLocalDay(parsed);
}

// CONSUMO DE API
function renderWeek(menu) {
  const container = document.getElementById("menu-week");
  if (!container) return;

  container.innerHTML = "";

  menu.forEach((item) => {
    const dia = String(item.dia || "").trim();
    const tags = stripTags(item.tags);
    const desc = String(item.descripcion || "").trim();

    const weekItem = document.createElement("div");
    weekItem.className = "week-item";

    const header = document.createElement("button");
    header.className = "week-header";
    header.type = "button";
    header.setAttribute("aria-expanded", "false");

    const strong = document.createElement("strong");
    strong.textContent = dia || "-";

    const span = document.createElement("span");
    span.textContent = `${tags || "Menú a confirmar"}`;

    header.appendChild(strong);
    header.appendChild(span);

    const descBox = document.createElement("div");
    descBox.className = "week-desc text-muted";
    descBox.hidden = true;
    descBox.textContent = desc || "Descripción a confirmar.";

    weekItem.appendChild(header);
    weekItem.appendChild(descBox);
    container.appendChild(weekItem);
  });
}

// ACORDEÓN ESTRICTO
function setupStrictAccordion() {
  const container = document.getElementById("menu-week");
  if (!container) return;

  // Evita duplicar listeners si loadMenu corre más de una vez
  if (container.dataset.accordionReady === "1") return;
  container.dataset.accordionReady = "1";

  container.addEventListener("click", (e) => {
    const header = e.target.closest(".week-header");
    if (!header) return;

    const item = header.closest(".week-item");
    if (!item) return;

    const desc = item.querySelector(".week-desc");
    if (!desc) return;

    const isOpen = !desc.hidden;

    // Cerrar todos
    container.querySelectorAll(".week-desc").forEach((d) => (d.hidden = true));
    container
      .querySelectorAll(".week-header[aria-expanded='true']")
      .forEach((h) => h.setAttribute("aria-expanded", "false"));

    // Abrir solo este si estaba cerrado
    if (!isOpen) {
      desc.hidden = false;
      header.setAttribute("aria-expanded", "true");
    }
  });
}

function formatDateES(date) {
  return date.toLocaleDateString("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function dayIndexMon0(date = new Date()) {
  // lunes=0 ... domingo=6
  return (date.getDay() + 6) % 7;
}

function paintToday({ dateText, tags, desc }) {
  const elDate = document.getElementById("menu-date");
  const elTags = document.getElementById("menu-tags");
  const elDesc = document.getElementById("menu-desc");
  const elPrice = document.getElementById("menu-price");

  if (elDate) elDate.textContent = dateText;
  if (elTags) elTags.textContent = tags || "";
  if (elDesc) elDesc.textContent = desc || "";

  if (elPrice) elPrice.style.display = "";
}

function resetMenuContent() {
  const elDate = document.getElementById("menu-date");
  const elTags = document.getElementById("menu-tags");
  const elDesc = document.getElementById("menu-desc");
  const elFallback = document.getElementById("menu-fallback");
  const elPrice = document.getElementById("menu-price");
  const loadingEl = document.getElementById("menu-loading");
  const weekEl = document.getElementById("menu-week");

  if (elDate) elDate.textContent = "";
  if (elTags) elTags.textContent = "";
  if (elDesc) elDesc.textContent = "";
  if (loadingEl) loadingEl.hidden = true;
  if (weekEl) weekEl.innerHTML = "";
  if (elFallback) {
    elFallback.textContent = "";
    elFallback.hidden = true;
  }
  if (elPrice) elPrice.style.display = "none";
  hideWeeklySpecial();
}

function hideMenuBecauseUnavailable() {
  resetMenuContent();
  hideMenuSection();
}

async function loadMenu() {
  const loadingEl = document.getElementById("menu-loading");
  hideMenuBecauseUnavailable();

  try {
    const res = await fetch(MENU_API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el menú");

    const data = await res.json();

    // --- Blindaje mínimo ---
    if (!data || typeof data !== "object") {
      return;
    }

    if (!data.semana_inicio) {
      return;
    }

    if (!Array.isArray(data.menu) || data.menu.length === 0) {
      return;
    }

    const start = parseSheetDate(data.semana_inicio);
    if (!start) {
      return;
    }

    const today = startOfLocalDay(new Date());
    const diffDays = Math.round((today - start) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 4) {
      return;
    }

    const item = data.menu[diffDays];
    if (!item || typeof item !== "object") {
      return;
    }

    const tags = stripTags(item?.tags);
    const desc = safeText(item?.descripcion);

    if (!tags && !desc) {
      return;
    }

    const shownDate = new Date(start);
    shownDate.setDate(shownDate.getDate() + diffDays);

    showMenuSection();

    const weekly = data.plato_semanal;
    if (weekly && (safeText(weekly.nombre) || safeText(weekly.descripcion))) {
      paintWeeklySpecial({
        nombre: safeText(weekly.nombre),
        descripcion: safeText(weekly.descripcion),
      });
    } else {
      hideWeeklySpecial();
    }

    renderWeek(data.menu);
    setupStrictAccordion();

    paintToday({
      dateText: formatDateES(shownDate),
      tags: tags || "Menú a confirmar",
      desc: desc || "",
    });

    // ✅ ocultar loader cuando está todo OK
    if (loadingEl) loadingEl.hidden = true;
  } catch (err) {
    console.error("Error cargando menú:", err);
    hideMenuBecauseUnavailable();
  }
}

loadMenu();
