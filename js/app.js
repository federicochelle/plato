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

(() => {
  const AUTOPLAY_MS = 5500;

  // =====================================================
  // CAROUSEL (autoplay + flechas + loop)
  // =====================================================
  const getIndexFromScroll = (track) => {
    const w = track.clientWidth || 1;
    return Math.round(track.scrollLeft / w);
  };

  const scrollToIndex = (track, index, smooth = true) => {
    const w = track.clientWidth || 1;
    track.scrollTo({ left: w * index, behavior: smooth ? "smooth" : "auto" });
  };

  document.querySelectorAll(".gallery-track").forEach((track) => {
    const slides = Array.from(track.querySelectorAll(".gallery-slide"));
    if (slides.length <= 1) return;

    const wrap = track.closest(".gallery-wrap") || track.parentElement;
    const prevBtn = wrap?.querySelector(".gallery-prev");
    const nextBtn = wrap?.querySelector(".gallery-next");

    const next = (smooth = true) => {
      const i = getIndexFromScroll(track);
      if (i >= slides.length - 1) {
        scrollToIndex(track, 0, false);
        requestAnimationFrame(() => scrollToIndex(track, 0, smooth));
      } else {
        scrollToIndex(track, i + 1, smooth);
      }
    };

    const prev = (smooth = true) => {
      const i = getIndexFromScroll(track);
      if (i <= 0) {
        scrollToIndex(track, slides.length - 1, false);
        requestAnimationFrame(() =>
          scrollToIndex(track, slides.length - 1, smooth),
        );
      } else {
        scrollToIndex(track, i - 1, smooth);
      }
    };

    // flechas
    prevBtn?.addEventListener("click", () => {
      stop();
      prev(true);
      start();
    });

    nextBtn?.addEventListener("click", () => {
      stop();
      next(true);
      start();
    });

    // autoplay + pausa
    let timer = null;
    let paused = false;

    const start = () => {
      stop();
      timer = setInterval(() => {
        if (!paused) next(true);
      }, AUTOPLAY_MS);
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const pause = () => (paused = true);
    const resume = () => (paused = false);

    wrap?.addEventListener("mouseenter", pause);
    wrap?.addEventListener("mouseleave", resume);

    track.addEventListener("pointerdown", pause, { passive: true });
    track.addEventListener("pointerup", resume, { passive: true });
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", resume, { passive: true });

    track.addEventListener(
      "scroll",
      () => {
        pause();
        clearTimeout(track.__scrollTO);
        track.__scrollTO = setTimeout(resume, 350);
      },
      { passive: true },
    );

    window.addEventListener("resize", () => {
      const i = getIndexFromScroll(track);
      scrollToIndex(track, i, false);
    });

    start();
  });

  // =====================================================
  // LIGHTBOX (global) — compatible con data-lightbox
  // =====================================================
  const modal = document.getElementById("lightbox");
  if (!modal) return;

  const imgEl = modal.querySelector(".lb-img");
  const titleEl = modal.querySelector(".lb-title");
  const descEl = modal.querySelector(".lb-desc");
  const waEl = modal.querySelector("#lb-wa");
  const btnPrev = modal.querySelector(".lb-prev");
  const btnNext = modal.querySelector(".lb-next");

  let items = [];
  let currentIndex = 0;
  let lastFocus = null;

  const collectItems = () => {
    items = Array.from(document.querySelectorAll("[data-lightbox]"));
  };

  const render = () => {
    const item = items[currentIndex];
    if (!item) return;

    const src =
      item.getAttribute("data-lightbox") || item.getAttribute("data-src") || "";
    const title =
      item.getAttribute("data-title") ||
      item.querySelector(".gallery-cap")?.textContent?.trim() ||
      item.querySelector("img")?.alt ||
      "";
    const desc = item.getAttribute("data-desc") || "";

    imgEl.src = src;
    imgEl.alt = title || "Imagen";
    titleEl.textContent = title;
    descEl.textContent = desc;

    if (waEl) {
      const phone = "59891640124";
      const msg = encodeURIComponent(`Hola! Quiero pedir: ${title}.`);
      waEl.href = `https://wa.me/${phone}?text=${msg}`;
    }
  };

  const openAt = (index) => {
    collectItems();
    if (items.length === 0) return;
    currentIndex = (index + items.length) % items.length;

    render();

    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    lastFocus = document.activeElement;
    modal.querySelector(".lb-close")?.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  const go = (dir) => {
    collectItems();
    if (items.length === 0) return;
    currentIndex = (currentIndex + dir + items.length) % items.length;
    render();
  };

  // abrir
  document.addEventListener("click", (e) => {
    const item = e.target.closest?.("[data-lightbox]");
    if (!item) return;
    e.preventDefault();

    collectItems();
    const idx = items.indexOf(item);
    openAt(idx);
  });

  // cerrar overlay / data-close
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) close();
  });

  btnPrev?.addEventListener("click", () => go(-1));
  btnNext?.addEventListener("click", () => go(1));

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  // swipe en el modal
  let x0 = null;
  imgEl?.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), {
    passive: true,
  });
  imgEl?.addEventListener(
    "touchend",
    (e) => {
      if (x0 == null) return;
      const x1 = e.changedTouches[0].clientX;
      const dx = x1 - x0;
      x0 = null;
      if (Math.abs(dx) < 35) return;
      go(dx > 0 ? -1 : 1);
    },
    { passive: true },
  );
})();
