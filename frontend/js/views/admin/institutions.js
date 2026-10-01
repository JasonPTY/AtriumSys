import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { applyTheme } from "../../core/theme.js";
import { INST, instKeys, isActive, demoStats, persistInstitutions } from "../../data/institutions.js";
import { ic } from "../../ui/icons.js";
import { card, table, pill, statusPill, btn, iconBtn } from "../../ui/components.js";
import { modal, closeModal } from "../../ui/modal.js";
import { toast } from "../../ui/toast.js";

export const institutionStatus = (t) => statusPill(isActive(t) ? "Activo" : "Inactivo");

/** Listado de instituciones con ver / editar / activar-desactivar. */
export const institutionsView = () =>
  `<div class="acts"><button class="btn" onclick="instNew()">${ic("plus")}Nueva institución</button></div>` +
  card(
    "Instituciones",
    table(
      ["Institución", "Nombre corto", "Estudiantes", "Admin institucional", "Estado", "Acciones"],
      instKeys().map((k) => {
        const t = INST[k];
        return [
          t.n,
          t.s,
          demoStats(t).e,
          t.adm || "Sin asignar",
          institutionStatus(t),
          `<div class="ra">${iconBtn("eye", "Ver detalles", `instView('${k}')`)}${iconBtn("edit", "Editar", `instEdit('${k}')`)}<button class="btn o" onclick="instToggle('${k}')">${isActive(t) ? "Desactivar" : "Activar"}</button></div>`,
        ];
      })
    )
  );

/** Punto de integracion: crear institucion. */
function instNew() {
  state.newLogo = "";
  const row = (label, id, extra = "") => `<div class="mrow"><label>${label}</label><input id="${id}" ${extra}></div>`;
  modal(
    "Nueva institución",
    row("Nombre", "ni_n") +
      row("Nombre corto", "ni_s") +
      row("Lema", "ni_l") +
      row("Sitio web", "ni_w") +
      row("Correo de contacto", "ni_c", 'type="email"') +
      `<div class="mrow"><label>Logo</label><input type="file" accept="image/*" onchange="instLogo(this)"></div>` +
      row("Admin institucional", "ni_a", 'placeholder="Nombre completo"') +
      row("Correo del admin", "ni_m", 'type="email"'),
    btn("Cancelar", "o", "closeModal()") + btn("Crear institución", "g", "instCreate()")
  );
}

function instLogo(input) {
  const f = input.files[0];
  if (!f) return;
  if (f.size > 300000) {
    input.value = "";
    return toast("El logo debe pesar menos de 300 KB");
  }
  const r = new FileReader();
  r.onload = () => (state.newLogo = r.result);
  r.readAsDataURL(f);
}

function instCreate() {
  const g = (k) => $("ni_" + k).value.trim();
  if (!g("n") || !g("s") || !g("a") || !g("m")) return toast("Completa nombre, nombre corto y admin institucional");
  INST["i" + Date.now()] = { n: g("n"), s: g("s"), lema: g("l"), web: g("w"), mail: g("c"), logo: state.newLogo, c1: "#1E3A8A", c2: "#10B981", adm: g("a"), amail: g("m") };
  persistInstitutions();
  closeModal();
  applyTheme();
  render();
  toast("Institución creada");
}

function instView(k) {
  const t = INST[k],
    x = demoStats(t);
  modal(
    "Detalle de la institución",
    `<div class="dl"><div><small>Nombre</small><b>${t.n}</b></div><div><small>Nombre corto</small><b>${t.s}</b></div><div><small>Estado</small>${institutionStatus(t)}</div><div><small>Admin institucional</small><b>${t.adm || "Sin asignar"}</b></div><div><small>Estudiantes</small><b>${x.e}</b></div><div><small>Profesores</small><b>${x.p}</b></div><div><small>Cursos</small><b>${x.c}</b></div><div><small>Asistencia</small>${pill(x.a)}</div><div><small>Sitio web</small><b>${t.web || "—"}</b></div><div><small>Contacto</small><b>${t.mail || "—"}</b></div></div>`,
    btn("Cerrar", "o", "closeModal()") + btn("Editar", "", `instEdit('${k}')`)
  );
}

function instEdit(k) {
  const t = INST[k];
  const f = (label, id, v) => `<div class="mrow"><label>${label}</label><input id="ie_${id}" value="${v || ""}"></div>`;
  modal(
    "Editar institución",
    f("Nombre", "n", t.n) + f("Nombre corto", "s", t.s) + f("Lema", "l", t.lema) + f("Sitio web", "w", t.web) + f("Contacto", "c", t.mail),
    btn("Cancelar", "o", "closeModal()") + btn("Guardar cambios", "g", `instSave('${k}')`)
  );
}

function instSave(k) {
  const g = (i) => $("ie_" + i).value.trim(),
    t = INST[k];
  if (!g("n") || !g("s")) return toast("Completa nombre y nombre corto");
  Object.assign(t, { n: g("n"), s: g("s"), lema: g("l"), web: g("w"), mail: g("c") });
  persistInstitutions();
  closeModal();
  applyTheme();
  render();
  toast("Institución actualizada");
}

function instToggle(k) {
  INST[k].act = !isActive(INST[k]);
  persistInstitutions();
  applyTheme();
  render();
  toast(isActive(INST[k]) ? "Institución activada" : "Institución desactivada");
}

export const institutionHandlers = { instNew, instLogo, instCreate, instView, instEdit, instSave, instToggle };
