import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { db, ENTITY_NAMES, ENTITY_FIELDS } from "../../data/school.js";
import { ic } from "../../ui/icons.js";
import { card, table, progress, statusPill, btn, iconBtn } from "../../ui/components.js";
import { modal, closeModal } from "../../ui/modal.js";
import { toast } from "../../ui/toast.js";

const rowActions = (t, i) =>
  `<div class="ra">${iconBtn("edit", "Editar", `editEntity('${t}',${i})`)}${iconBtn("trash", "Eliminar", `deleteEntity('${t}',${i})`, 'style="color:var(--bad)"')}</div>`;

/** Listado generico con boton "Nuevo" y acciones editar / eliminar por fila. */
const listView = (type, title, columns, rowFn) =>
  `<div class="acts"><button class="btn" onclick="editEntity('${type}',-1)">${ic("plus")}Nuevo ${ENTITY_NAMES[type]}</button></div>` +
  card(title, table([...columns, "Acciones"], db[type].map((r, i) => [...rowFn(r), rowActions(type, i)])));

export const crudViews = {
  profesores: () => listView("prof", "Carga académica", ["Profesor", "Cursos", "Horas/sem", "Carga"], (r) => [r.n, r.c, r.h, progress(Math.min(100, Math.round((r.h / 20) * 100)))]),
  estudiantes: () => listView("est", "Estudiantes", ["Nombre", "Programa", "Cursos", "Estado"], (r) => [r.n, r.p, r.c, statusPill(r.s)]),
  cursos: () => listView("cur", "Catálogo de cursos", ["Código", "Curso", "Profesor", "Inscritos"], (r) => [r.k, r.n, r.pr, r.i]),
  grupos: () => listView("grp", "Grupos", ["Grupo", "Curso", "Profesor", "Estudiantes", "Horario"], (r) => [r.n, r.c, r.pr, r.i, r.h]),
};

/** i < 0 => crear; i >= 0 => editar el registro i. */
function editEntity(type, i) {
  const d = i < 0 ? {} : db[type][i];
  const fields = ENTITY_FIELDS[type]
    .map(([k, label, opt]) => {
      const q = typeof opt == "function" ? opt() : opt;
      return `<div class="mrow"><label>${label}</label>${
        Array.isArray(q)
          ? `<select id="e_${k}">${q.map((x) => `<option ${x == d[k] ? "selected" : ""}>${x}</option>`).join("")}</select>`
          : `<input id="e_${k}" type="${q || "text"}" value="${d[k] ?? ""}">`
      }</div>`;
    })
    .join("");
  modal((i < 0 ? "Nuevo " : "Editar ") + ENTITY_NAMES[type], fields, btn("Cancelar", "o", "closeModal()") + btn("Guardar cambios", "g", `saveEntity('${type}',${i})`));
}

/** Punto de integracion: POST / PUT del profesor, estudiante, curso o grupo. */
function saveEntity(type, i) {
  const d = i < 0 ? {} : db[type][i];
  ENTITY_FIELDS[type].forEach(([k, , opt]) => {
    const v = $("e_" + k).value;
    d[k] = opt == "number" ? +v : v;
  });
  if (i < 0) db[type].push(d);
  closeModal();
  render();
  toast("Cambios guardados");
}

function deleteEntity(type, i) {
  modal(
    "Eliminar " + ENTITY_NAMES[type],
    `<p style="margin:0">¿Eliminar <b>${db[type][i].n}</b>? Esta acción no se puede deshacer.</p>`,
    btn("Cancelar", "o", "closeModal()") + `<button class="btn" style="background:var(--bad)" onclick="deleteEntityOk('${type}',${i})">Eliminar</button>`
  );
}

/** Punto de integracion: DELETE. */
function deleteEntityOk(type, i) {
  db[type].splice(i, 1);
  closeModal();
  render();
  toast("Eliminado");
}

export const crudHandlers = { editEntity, saveEntity, deleteEntity, deleteEntityOk };
