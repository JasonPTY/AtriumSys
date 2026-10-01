import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { db, attendancePct } from "../../data/school.js";
import { ic } from "../../ui/icons.js";
import { card, table, pill, btn, iconBtn } from "../../ui/components.js";
import { modal, closeModal } from "../../ui/modal.js";
import { toast } from "../../ui/toast.js";

const findRecord = (id) => db.hist.find((h) => h.id == id);

/** Historial de asistencias. Admin institucional ve todo; profesor solo lo suyo. */
export function historyView() {
  const all = state.role != "prof";
  const list = all ? db.hist : db.hist.filter((h) => h.pr == "Dr. Rivas");
  const headers = ["Fecha", "Curso", ...(all ? ["Profesor"] : []), "Presentes", "Ausentes", "Asistencia", "Acciones"];
  const rows = list.map((h) => [
    h.f,
    h.c,
    ...(all ? [h.pr] : []),
    h.p,
    h.a,
    pill(attendancePct(h)),
    `<div class="ra">${iconBtn("eye", "Ver detalles", `histView(${h.id})`)}${iconBtn("edit", "Editar", `histEdit(${h.id})`)}${iconBtn("trash", "Eliminar", `histDelete(${h.id})`, 'style="color:var(--bad)"')}</div>`,
  ]);
  return `<div class="acts"><button class="btn o" onclick="exportModal()">${ic("down")}Exportar</button></div>` + card(all ? "Asistencia dictada por profesores" : "Clases dictadas", table(headers, rows));
}

function histView(id) {
  const h = findRecord(id);
  modal(
    "Detalle de la clase",
    `<div class="dl"><div><small>Curso</small><b>${h.c}</b></div><div><small>Fecha</small><b>${h.f}</b></div><div><small>Profesor</small><b>${h.pr}</b></div><div><small>Asistencia</small>${pill(attendancePct(h))}</div><div><small>Presentes</small><b style="color:var(--ok)">${h.p}</b></div><div><small>Ausentes</small><b style="color:var(--bad)">${h.a}</b></div></div>`,
    btn("Cerrar", "o", "closeModal()") + btn("Editar", "", `histEdit(${id})`)
  );
}

function histEdit(id) {
  const h = findRecord(id);
  modal(
    "Editar registro",
    `<div class="mrow"><label>Fecha</label><input id="ef" value="${h.f}"></div><div class="mrow"><label>Presentes</label><input id="ep" type="number" min="0" value="${h.p}"></div><div class="mrow"><label>Ausentes</label><input id="ea" type="number" min="0" value="${h.a}"></div>`,
    btn("Cancelar", "o", "closeModal()") + btn("Guardar cambios", "g", `histSave(${id})`)
  );
}

function histSave(id) {
  const h = findRecord(id);
  h.f = $("ef").value;
  h.p = +$("ep").value;
  h.a = +$("ea").value;
  closeModal();
  render();
  toast("Registro actualizado");
}

function histDelete(id) {
  const h = findRecord(id);
  modal(
    "Eliminar registro",
    `<p style="margin:0">¿Eliminar la clase de <b>${h.c}</b> del ${h.f}? Esta acción no se puede deshacer.</p>`,
    btn("Cancelar", "o", "closeModal()") + `<button class="btn" style="background:var(--bad)" onclick="histDeleteOk(${id})">Eliminar</button>`
  );
}

function histDeleteOk(id) {
  db.hist = db.hist.filter((x) => x.id != id);
  closeModal();
  render();
  toast("Registro eliminado");
}

// Funciones llamadas desde atributos onclick (se publican en window desde main.js).
export const historyHandlers = { histView, histEdit, histSave, histDelete, histDeleteOk };
