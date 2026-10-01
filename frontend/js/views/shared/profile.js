import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { USER } from "../../data/users.js";
import { ic } from "../../ui/icons.js";
import { btn, statusPill } from "../../ui/components.js";
import { ring } from "../../ui/charts.js";
import { toast } from "../../ui/toast.js";

const FIELDS = [["Nombre completo", "n"], ["Correo institucional", "e"], ["Teléfono", "t"], ["Idioma", "i"]];
const PREFS = ["Alertas por correo", "Notificaciones en el panel", "Resumen semanal"];

/** Perfil del usuario (lectura / edicion). Comun a todos los roles. */
export function profileView() {
  const role = state.role,
    editing = state.profileEditing,
    u = USER[role];
  const d = state.profileData[role] || (state.profileData[role] = { n: u.name, e: u.email, t: "+507 6000-0000", i: "Español" });
  const student = role == "est";
  return (
    `<div class="card pf"><div class="cover"></div><div class="pfh"><div class="av xl">${u.initials}</div><div style="flex:1;min-width:160px"><h3 style="font-size:20px;margin:0">${d.n}</h3><span style="color:var(--mu)">${u.label}</span></div><span class="pill ok">Cuenta activa</span>` +
    (editing ? btn("Cancelar", "o", "profileEdit(false)") + btn("Guardar", "g", "profileSave()") : btn(ic("edit") + "Editar perfil", "", "profileEdit(true)")) +
    `</div></div>` +
    `<div class="grid g2"><div class="card"><h3>Información personal</h3><div class="kv">${FIELDS.map(([label, k]) => `<div class="f"><span>${label}</span>${editing ? `<input id="pf_${k}" value="${d[k]}">` : `<b>${d[k]}</b>`}</div>`).join("")}</div></div>` +
    `<div><div class="card" style="display:flex;gap:18px;align-items:center;margin-bottom:16px;flex-wrap:wrap">${ring(student ? 92 : 95)}<div><b>Asistencia ${student ? "personal" : "de mis cursos"}</b><br><span style="color:var(--mu)">${student ? "Ingeniería · Semestre 4" : "Periodo 2026-II"}</span><br>${statusPill(student ? "Regular" : "Activo")}</div></div>` +
    `<div class="card"><h3>Preferencias</h3>${PREFS.map((t, i) => `<label class="sw ${editing ? "" : "off"}"><span>${t}</span><input type="checkbox" ${i < 2 ? "checked" : ""} ${editing ? "" : "disabled"}><i></i></label>`).join("")}</div></div></div>`
  );
}

function profileEdit(on) {
  state.profileEditing = on;
  render();
}

/** Punto de integracion: guardar perfil en el backend. */
function profileSave() {
  const d = state.profileData[state.role];
  ["n", "e", "t", "i"].forEach((k) => (d[k] = $("pf_" + k).value));
  state.profileEditing = false;
  render();
  toast("Perfil actualizado");
}

export const profileHandlers = { profileEdit, profileSave };
