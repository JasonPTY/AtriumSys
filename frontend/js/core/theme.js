import { state } from "./state.js";
import { $ } from "./dom.js";
import { INST } from "../data/institutions.js";

/** Aplica marca (logo, nombre, titulo) y selector de institucion segun rol e institucion activa. */
export function applyTheme() {
  const t = state.role == "admin" ? { n: "Plataforma global", s: "AT", logo: "" } : INST[state.inst];
  document.title = "ATRIUM · " + t.s;
  document.querySelector(".logo").innerHTML = `<span class="lg">${t.logo ? `<img src="${t.logo}" alt="">` : t.s.slice(0, 2)}</span><span class="lb">ATRI<b>UM</b></span>`;
  document.querySelector(".sub").textContent = t.n;
  $("per").textContent = t.s + " · Periodo 2026-II · Semestre en curso";
  document.querySelector("footer span").textContent = "© 2026 " + t.n;
  $("inst").parentElement.style.display = state.role == "admin" ? "none" : "";
  $("inst").innerHTML = Object.keys(INST)
    .map((k) => `<option value="${k}" ${k == state.inst ? "selected" : ""}>${INST[k].s}${INST[k].act === false ? " (inactiva)" : ""}</option>`)
    .join("");
}
