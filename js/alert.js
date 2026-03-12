document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("event-popup");
  const closeBtn = document.getElementById("popup-close");

  if (!popup || !closeBtn) return;

  // aparece después de un pequeño delay
  setTimeout(() => {
    popup.classList.add("is-visible");
  }, 600);

  // cerrar con botón
  closeBtn.addEventListener("click", () => {
    popup.classList.remove("is-visible");
  });

  // cerrar si hacen click fuera del flyer
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("is-visible");
    }
  });
});
