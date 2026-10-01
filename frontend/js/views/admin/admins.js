import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { INST, instKeys, persistInstitutions } from "../../data/institutions.js";
import { ic } from "../../ui/icons.js";
import { card, table, btn, iconBtn } from "../../ui/components.js";
import { modal, closeModal } from "../../ui/modal.js";
import { toast } from "../../ui/toast.js";

/** Administradores institucionales (uno por institucion). */
export const adminsView = () =>
  `<div class="acts"><button class="btn" onclick="adminEdit('')">${ic("plus")}Asignar administrador</button></div>` +
  card(
    "Administradores institucionales",
    table(
      ["Administrador", "Correo", "Institución", "Acciones"],
      instKeys().map((k) => {
        const t = INST[k];
        return [t.adm || "Sin asignar", t.amail || "—", t.n, `<div class="ra">${iconBtn("edit", "Editar", `adminEdit('${k}')`)}${iconBtn("trash", "Quitar", `adminRemove('${k}')`, 'style="color:var(--bad)"')}</div>`];
      })
    )
  );

/** k = clave de institucion para editar; "" para asignar a otra. */
function adminEdit(k) {
  modal(
    k ? "Editar administrador" : "Asignar administrador",
    `<div class="mrow"><label>Institución</label><select id="ai_k" ${k ? "disabled" : ""}>${instKeys().map((x) => `<option value="${x}" ${x == k ? "selected" : ""}>${INST[x].n}</option>`).join("")}</select></div>` +
      `<div class="mrow"><label>Nombre</label><input id="ai_n" value="${k ? INST[k].adm || "" : ""}"></div>` +
      `<div class="mrow"><label>Correo</label><input id="ai_m" type="email" value="${k ? INST[k].amail || "" : ""}"></div>`,
    btn("Cancelar", "o", "closeModal()") + btn("Guardar", "g", "adminSave()")
  );
}

/** Punto de integracion: asignar / actualizar administrador institucional. */
function adminSave() {
  const t = INST[$("ai_k").value];
  if (!$("ai_n").value.trim() || !$("ai_m").value.trim()) return toast("Completa nombre y correo");
  t.adm = $("ai_n").value.trim();
  t.amail = $("ai_m").value.trim();
  persistInstitutions();
  closeModal();
  render();
  toast("Administrador asignado");
}

function adminRemove(k) {
  INST[k].adm = "";
  INST[k].amail = "";
  persistInstitutions();
  render();
  toast("Administrador quitado");
}

export const adminsHandlers = { adminEdit, adminSave, adminRemove };
