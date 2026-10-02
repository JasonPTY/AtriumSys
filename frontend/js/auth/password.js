// Política de contraseñas y medidor de fortaleza.
import { PASS_MIN } from "./config.js";

export function evaluate(pw, ctx = "") {
  const local = (ctx.split("@")[0] || "").toLowerCase();
  const rules = [
    [`Mínimo ${PASS_MIN} caracteres`, pw.length >= PASS_MIN],
    ["Una mayúscula y una minúscula", /[a-z]/.test(pw) && /[A-Z]/.test(pw)],
    ["Un número", /\d/.test(pw)],
    ["Un símbolo (!, ?, #, …)", /[^A-Za-z0-9]/.test(pw)],
    ["No contiene tu usuario o correo", !local || local.length < 3 || !pw.toLowerCase().includes(local)],
  ].map(([label, ok]) => ({ label, ok }));
  const passed = rules.filter((r) => r.ok).length;
  return { rules, ok: passed === rules.length, score: pw ? Math.max(1, Math.min(4, passed - 1)) : 0 };
}

const LABELS = ["", "Débil", "Aceptable", "Buena", "Fuerte"];
export const meterHtml = (r) =>
  `<div class="au-meter s${r.score}" aria-hidden="true"><i></i><i></i><i></i><i></i></div><small class="au-mlabel">${LABELS[r.score] || "Escribe una contraseña"}</small>` +
  `<ul class="au-rules">${r.rules.map((x) => `<li class="${x.ok ? "ok" : ""}">${x.label}</li>`).join("")}</ul>`;
