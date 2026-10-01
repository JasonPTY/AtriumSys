import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { db, attendancePct } from "../../data/school.js";
import { ic } from "../../ui/icons.js";
import { card, table, kpi, pill, btn } from "../../ui/components.js";
import { modal, closeModal } from "../../ui/modal.js";
import { toast } from "../../ui/toast.js";

// Lista de estudiantes de ejemplo para tomar asistencia.
const ROSTER = ["Ana Torres", "Bruno Díaz", "Camila Ríos", "Diego Soto", "Elena Paz", "Felipe Luna", "Gabriela Ortiz", "Hugo Vargas", "Inés Molina", "Jorge Cruz"];

/** Sesion en curso: { c: curso, g: grupo, f: fecha, h: hora, r: [[estudiante, 1 | 0 | null], ...] } */

/** Pantalla de asistencia: lista de sesiones, o la lista de estudiantes si hay una sesion abierta. */
export const attendanceView = () =>
  state.session
    ? takeAttendance()
    : `<div class="acts"><button class="btn g" onclick="newSession()">${ic("plus")}Crear asistencia</button></div>` +
      card(
        "Sesiones recientes",
        table(
          ["Fecha", "Curso", "Grupo", "Presentes", "Ausentes", "Asistencia"],
          db.hist.filter((h) => h.pr == "Dr. Rivas").map((h) => [h.f, h.c, h.g || "A", h.p, h.a, pill(attendancePct(h))])
        )
      );

function takeAttendance() {
  const s = state.session,
    r = s.r,
    p = r.filter((x) => x[1] === 1).length,
    a = r.filter((x) => x[1] === 0).length;
  return (
    `<div class="card" style="margin-bottom:16px"><div class="chips"><span>${ic("book")}${s.c}</span><span>${ic("users")}${s.g}</span><span>${ic("cal")}${s.f}</span><span>${ic("clock")}${s.h}</span><span>${ic("id")}Dr. Carlos Rivas</span></div></div>` +
    `<div class="grid">${kpi("Presentes", p, "#10B981", "check") + kpi("Ausentes", a, "#EF4444", "users") + kpi("Sin marcar", r.length - p - a, "#F59E0B", "clock")}</div>` +
    card(
      "Lista de estudiantes · " + r.length,
      `<div class="bar" style="margin-bottom:14px"><i style="width:${((p + a) / r.length) * 100}%;background:var(--ok)"></i></div>` +
        `<div class="acts" style="margin-bottom:6px"><button class="btn o" onclick="markAll()">Marcar todos presentes</button></div>` +
        r
          .map(
            (x, i) =>
              `<div class="stu"><div class="av sm">${x[0][0]}</div><b>${x[0]}</b><div class="seg"><button class="${x[1] === 1 ? "on ok" : ""}" onclick="mark(${i},1)">Asistió</button><button class="${x[1] === 0 ? "on no" : ""}" onclick="mark(${i},0)">No asistió</button></div></div>`
          )
          .join("") +
        `<div class="acts" style="margin:16px 0 0;justify-content:flex-end"><button class="btn o" onclick="cancelSession()">Cancelar</button><button class="btn g" onclick="saveSession()">Guardar asistencia</button></div>`
    )
  );
}

function newSession() {
  const n = new Date();
  modal(
    "Crear asistencia",
    `<div class="mrow"><label>Curso</label><select id="sc"><option>Cálculo I</option><option>Programación</option></select></div>` +
      `<div class="mrow"><label>Grupo</label><select id="sg"><option>Grupo A</option><option>Grupo B</option></select></div>` +
      `<div class="mrow"><label>Fecha</label><input id="sf" value="${n.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}" readonly></div>` +
      `<div class="mrow"><label>Hora</label><input id="sh" type="time" value="${n.toTimeString().slice(0, 5)}"></div>` +
      `<div class="mrow"><label>Profesor</label><input value="Dr. Carlos Rivas" readonly></div>`,
    btn("Cancelar", "o", "closeModal()") + btn("Crear y tomar lista", "g", "startSession()")
  );
}

function startSession() {
  const g = $("sg").value;
  state.session = {
    c: $("sc").value,
    g,
    f: $("sf").value,
    h: $("sh").value,
    r: (g == "Grupo A" ? ROSTER.slice(0, 7) : ROSTER.slice(3)).map((x) => [x, null]),
  };
  closeModal();
  render();
}

function mark(i, v) {
  state.session.r[i][1] = v;
  render();
}

function markAll() {
  state.session.r.forEach((x) => (x[1] = 1));
  render();
}

function cancelSession() {
  state.session = null;
  render();
}

/** Punto de integracion: guardar la asistencia en el backend. */
function saveSession() {
  const s = state.session,
    r = s.r,
    pending = r.filter((x) => x[1] === null).length;
  if (pending) return toast("Faltan " + pending + " estudiantes por marcar");
  db.hist.unshift({
    id: Date.now(),
    f: s.f,
    c: s.c,
    g: s.g.slice(-1),
    pr: "Dr. Rivas",
    p: r.filter((x) => x[1] === 1).length,
    a: r.filter((x) => x[1] === 0).length,
  });
  state.session = null;
  render();
  toast("Asistencia guardada");
}

export const attendanceHandlers = { newSession, startSession, mark, markAll, cancelSession, saveSession };
