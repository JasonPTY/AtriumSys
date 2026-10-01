/** Abre un modal. `footer` es HTML de botones. Cierra cualquier modal previo. */
export function modal(title, body, footer = "") {
  closeModal();
  const m = document.createElement("div");
  m.className = "mo";
  m.id = "mo";
  m.innerHTML = `<div class="md" role="dialog" aria-label="${title}"><div class="mh"><h3>${title}</h3><button class="ib" onclick="closeModal()" aria-label="Cerrar">✕</button></div><div class="mb">${body}</div><div class="mf">${footer}</div></div>`;
  m.onclick = (e) => {
    if (e.target === m) closeModal();
  };
  document.body.append(m);
}

export function closeModal() {
  const m = document.getElementById("mo");
  if (m) m.remove();
}
