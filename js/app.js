const chips = document.querySelectorAll("[data-filter]");
const items = document.querySelectorAll(".gallery-item");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    // UI estado activo
    chips.forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");

    const filter = chip.dataset.filter;

    items.forEach((item) => {
      const cat = item.dataset.category;
      const shouldShow = filter === "all" || cat === filter;

      item.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const overlay = document.querySelector(".menu-overlay");
const closeTargets = document.querySelectorAll("[data-menu-close]");

if (header && toggle && mobileMenu && overlay) {
  const openMenu = () => {
    header.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    overlay.hidden = false;
    mobileMenu.hidden = false;

    const firstLink = mobileMenu.querySelector("a, button");
    firstLink?.focus();
  };

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    overlay.hidden = true;
    mobileMenu.hidden = true;
    toggle.focus();
  };

  const isOpen = () => header.classList.contains("is-open");

  // Toggle botón hamburguesa
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isOpen() ? closeMenu() : openMenu();
  });

  // Click en overlay
  overlay.addEventListener("click", closeMenu);

  // Click en links del menú
  closeTargets.forEach((el) => el.addEventListener("click", closeMenu));

  // ⬅️ CLICK AFUERA REAL
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;

    const clickedInsideMenu =
      mobileMenu.contains(e.target) || toggle.contains(e.target);

    if (!clickedInsideMenu) {
      closeMenu();
    }
  });

  // Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // Resize → cierra si pasa a desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && isOpen()) closeMenu();
  });
}
// =========================
// MODAL (simple)
// =========================
const openButtons = document.querySelectorAll("[data-modal-open]");
const closeButtons = document.querySelectorAll("[data-modal-close]");

openButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-modal-open");
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const focusable = modal.querySelector(
      "button, a, input, [tabindex]:not([tabindex='-1'])",
    );
    focusable?.focus();
  });
});

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}

closeButtons.forEach((el) => {
  el.addEventListener("click", () => {
    const modal = el.closest(".modal");
    if (modal) closeModal(modal);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modal = document.querySelector(".modal:not([hidden])");
  if (modal) closeModal(modal);
});

// =========================
// LIGHTBOX
// =========================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-image");

function openLightbox(src, alt = "") {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  const item = e.target.closest("[data-lightbox]");
  if (item) {
    const img = item.querySelector("img");
    openLightbox(item.dataset.lightbox, img?.alt || "");
    return;
  }

  if (e.target.closest("[data-lightbox-close]")) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox && !lightbox.hidden) {
    closeLightbox();
  }
});
