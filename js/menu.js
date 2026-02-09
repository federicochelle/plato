const MENU_API_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgoytzxXqIfoYiyc6K8WVCLVf2_aLKpSq4x9DUI2Gy-B4KGtvSQXv3u-d7CJqv-ASti7eUkwCp5QDBJdJ7ik3Ezn5y-CGgzdOSJbWgOu36rkTNVt-mIEcoKvuu8pWV5j-dDFpqTSlvoAWZfGRm4GOAap4rxrcJxh5y5hURfWG2m2_FabiZHjCN5caFa2q2GPm3_YurzmHmSABjfm-MIPPnbIrBAI_oZ4zzK7HilfqXPktn0Yoc4aj5KfdzRyjbHZxg_IuKSft82DdYq2gtk9hzHQsi_1Q&lib=MqgZhj5zhhmIJ-EpNDB63jqsBj-ld1thL";

function stripTags(text) {
  return safeText(text).replace(/<[^>]*>/g, "");
}

function safeText(v) {
  return String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();
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
    span.textContent = `${tags || "Menú a confirmar"}`; // ✅ FIX

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
  const elFallback = document.getElementById("menu-fallback");
  const elPrice = document.getElementById("menu-price");

  if (elDate) elDate.textContent = dateText;
  if (elTags) elTags.textContent = tags || "";
  if (elDesc) elDesc.textContent = desc || "";

  if (elFallback) elFallback.hidden = true;

  if (elPrice) elPrice.style.display = "";
}

function showTodayFallback(msg) {
  const elDate = document.getElementById("menu-date");
  const elTags = document.getElementById("menu-tags");
  const elDesc = document.getElementById("menu-desc");
  const elFallback = document.getElementById("menu-fallback");
  const elPrice = document.getElementById("menu-price");

  if (elDate) elDate.textContent = formatDateES(new Date());
  if (elTags) elTags.textContent = "";
  if (elDesc) elDesc.textContent = "";

  if (elFallback) {
    elFallback.textContent = msg;
    elFallback.hidden = false;
  }

  const loadingEl = document.getElementById("menu-loading");
  if (loadingEl) loadingEl.hidden = true;

  if (elPrice) elPrice.style.display = "none";
}
async function loadMenu() {
  const loadingEl = document.getElementById("menu-loading");
  if (loadingEl) loadingEl.hidden = false;

  try {
    const res = await fetch(MENU_API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar el menú");

    const data = await res.json();

    // --- Blindaje mínimo ---
    if (!data || typeof data !== "object") {
      showTodayFallback("Menú no disponible.");
      return;
    }

    if (!data.semana_inicio) {
      showTodayFallback("Menú no disponible (faltan datos).");
      return;
    }

    if (!Array.isArray(data.menu) || data.menu.length < 5) {
      showTodayFallback("Menú no disponible (semana incompleta).");
      return;
    }

    // 1) Modal semanal
    renderWeek(data.menu);
    setupStrictAccordion();

    // 2) Semana vigente basada en la Sheet
    const start = new Date(data.semana_inicio);
    const today = new Date();

    if (today < start) {
      showTodayFallback(`El menú se publica desde el ${formatDateES(start)}.`);
      return;
    }

    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 4) {
      showTodayFallback(
        "Hoy no abrimos. Nos volvemos a encontrar el próximo lunes.",
      );
      return;
    }

    const item = data.menu[diffDays];
    const tags = stripTags(item?.tags);
    const desc = safeText(item?.descripcion);

    if (!tags && !desc) {
      showTodayFallback("Hoy no hay menú publicado.");
      return;
    }

    const shownDate = new Date(start);
    shownDate.setDate(start.getDate() + diffDays);

    paintToday({
      dateText: formatDateES(shownDate),
      tags: tags || "Menú a confirmar",
      desc: desc || "",
    });

    // ✅ ocultar loader cuando está todo OK
    if (loadingEl) loadingEl.hidden = true;
  } catch (err) {
    console.error("Error cargando menú:", err);
    showTodayFallback("Hoy no pudimos cargar el menú. Probá más tarde.");
  }
}

loadMenu();
