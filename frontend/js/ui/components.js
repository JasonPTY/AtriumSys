import { ic } from "./icons.js";

// ---- Porcentajes y estados ------------------------------------------------
export const barColor = (p) => (p >= 90 ? "var(--ok)" : p >= 80 ? "var(--warn)" : "var(--bad)");

/** Pastilla de porcentaje: verde >=90, ambar >=80, rojo debajo. */
export const pill = (p) => `<span class="pill ${p >= 90 ? "ok" : p >= 80 ? "wn" : "bad"}">${p}%</span>`;

/** Barra de progreso + pastilla. */
export const progress = (p) =>
  `<div style="display:flex;gap:8px;align-items:center"><div class="bar"><i style="width:${p}%;background:${barColor(p)}"></i></div>${pill(p)}</div>`;

/** Pastilla de estado textual (Activo, Regular, Pendiente, ...). */
export const statusPill = (s) =>
  `<span class="pill ${s == "Activo" || s == "Regular" ? "ok" : s == "Pendiente" || s == "En riesgo" ? "wn" : "bad"}">${s}</span>`;

// ---- Bloques ---------------------------------------------------------------
/** Tarjeta KPI con tendencia y sparkline de ejemplo (deterministas por etiqueta). */
export const kpi = (label, value, color, icon) => {
  const seed = [...label].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const points = Array.from({ length: 8 }, (_, k) => `${k * 12},${28 - (10 + (seed * (k + 3)) % 17)}`).join(" ");
  const up = seed % 3;
  return `<div class="card kpi"><div class="kh"><span>${label}</span><i style="color:${color}">${ic(icon)}</i></div><b>${value}</b><div class="kf"><em class="${up ? "up" : "dn"}">${up ? "▲ +" + (seed % 5 + 1) + "%" : "▼ −" + (seed % 4 + 1) + "%"}</em><svg viewBox="0 0 84 30" width="84" height="30"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg></div></div>`;
};

/** Tabla responsive (cada celda lleva data-l para el modo tarjeta en movil). */
export const table = (headers, rows) =>
  `<div class="tw"><table><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
    .map((r) => `<tr>${r.map((cell, j) => `<td data-l="${headers[j]}">${cell}</td>`).join("")}</tr>`)
    .join("")}</table></div>`;

export const card = (title, body, attrs = "") => `<div class="card" ${attrs}><h3>${title}</h3>${body}</div>`;

// ---- Botones ---------------------------------------------------------------
/** Boton de texto. `cls`: "" (primario) | "g" (verde) | "o" (contorno). */
export const btn = (label, cls, onclick) => `<button class="btn ${cls}" onclick="${onclick}">${label}</button>`;

/** Boton de icono (ver / editar / eliminar). */
export const iconBtn = (icon, label, onclick, extra = "") =>
  `<button class="ib" ${extra} title="${label}" aria-label="${label}" onclick="${onclick}">${ic(icon)}</button>`;

/** Boton de contorno que solo muestra un aviso (acciones aun sin backend). */
export const toastBtn = (label) => `<button class="btn o" onclick="toast('${label}')">${label}</button>`;
