import { COURSES } from "./courses.js";
import { state } from "../core/state.js";

/**
 * Datos de la institucion activa. Formas:
 *   prof: { n, c, h }            est: { n, p, c, s }
 *   cur:  { k, n, pr, i }        grp: { n, c, pr, i, h }
 *   hist: { id, f, c, g?, pr, p, a }   (historial de asistencias)
 */
export const db = {
  prof: [
    { n: "Dr. Rivas", c: "Cálculo I, Programación", h: 18 },
    { n: "Dra. Salas", c: "Física II", h: 9 },
    { n: "Dr. Peña", c: "Química General", h: 9 },
    { n: "Dra. Vega", c: "Historia Moderna", h: 6 },
  ],
  est: [
    { n: "Ana Torres", p: "Ingeniería", c: 5, s: "Regular" },
    { n: "Bruno Díaz", p: "Ingeniería", c: 4, s: "Regular" },
    { n: "Camila Ríos", p: "Ciencias", c: 5, s: "En riesgo" },
    { n: "Diego Soto", p: "Humanidades", c: 3, s: "Inactivo" },
  ],
  cur: COURSES.map((c) => ({ k: c.code, n: c.name, pr: c.prof, i: c.enrolled })),
  grp: [
    { n: "Cálculo I · A", c: "Cálculo I", pr: "Dr. Rivas", i: 22, h: "Lun y Mié 08:00" },
    { n: "Cálculo I · B", c: "Cálculo I", pr: "Dr. Rivas", i: 20, h: "Mar y Jue 10:00" },
    { n: "Física II · A", c: "Física II", pr: "Dra. Salas", i: 38, h: "Mar 14:00" },
    { n: "Programación · A", c: "Programación", pr: "Dr. Rivas", i: 45, h: "Mar y Jue 10:00" },
  ],
  hist: [
    { id: 1, f: "28 sep 2026", c: "Cálculo I", pr: "Dr. Rivas", p: 40, a: 2 },
    { id: 2, f: "27 sep 2026", c: "Programación", pr: "Dr. Rivas", p: 43, a: 2 },
    { id: 3, f: "26 sep 2026", c: "Física II", pr: "Dra. Salas", p: 34, a: 4 },
    { id: 4, f: "25 sep 2026", c: "Cálculo I", pr: "Dr. Rivas", p: 38, a: 4 },
    { id: 5, f: "25 sep 2026", c: "Química General", pr: "Dr. Peña", p: 30, a: 6 },
    { id: 6, f: "24 sep 2026", c: "Historia Moderna", pr: "Dra. Vega", p: 28, a: 2 },
  ],
};

/** Datos de las demas instituciones (aislamiento por institucion). */
export const STORE = {
  col: {
    prof: [{ n: "Prof. Ruiz", c: "Matemática 9°", h: 12 }],
    est: [
      { n: "Luis Mora", p: "9° grado", c: 6, s: "Regular" },
      { n: "Sofía Pardo", p: "9° grado", c: 6, s: "Regular" },
    ],
    cur: [{ k: "MAT-9", n: "Matemática 9°", pr: "Prof. Ruiz", i: 28 }],
    grp: [{ n: "Matemática 9° · A", c: "Matemática 9°", pr: "Prof. Ruiz", i: 28, h: "Lun y Mié 07:30" }],
    hist: [{ id: 101, f: "28 sep 2026", c: "Matemática 9°", pr: "Prof. Ruiz", p: 26, a: 2 }],
  },
};

/** Cambia de institucion: guarda los datos actuales y carga los de `next`. */
export function switchInstitution(next) {
  STORE[state.inst] = { prof: db.prof, est: db.est, cur: db.cur, grp: db.grp, hist: db.hist };
  const t = STORE[next] || { prof: [], est: [], cur: [], grp: [], hist: [] };
  db.prof = t.prof;
  db.est = t.est;
  db.cur = t.cur;
  db.grp = t.grp;
  db.hist = t.hist;
  state.inst = next;
}

/** Porcentaje de asistencia de un registro del historial. */
export const attendancePct = (h) => Math.round((h.p / (h.p + h.a)) * 100);

// ---- Metadatos del CRUD generico -------------------------------------------
export const ENTITY_NAMES = { prof: "profesor", est: "estudiante", cur: "curso", grp: "grupo" };

const profNames = () => db.prof.map((p) => p.n);
const courseNames = () => db.cur.map((c) => c.n);

/** Campos del formulario por entidad: [clave, etiqueta, tipo | opciones | () => opciones] */
export const ENTITY_FIELDS = {
  prof: [["n", "Nombre"], ["c", "Cursos asignados"], ["h", "Horas por semana", "number"]],
  est: [["n", "Nombre"], ["p", "Programa"], ["c", "Cursos inscritos", "number"], ["s", "Estado", ["Regular", "En riesgo", "Inactivo"]]],
  cur: [["k", "Código"], ["n", "Nombre del curso"], ["pr", "Profesor", profNames], ["i", "Inscritos", "number"]],
  grp: [["n", "Grupo"], ["c", "Curso", courseNames], ["pr", "Profesor", profNames], ["i", "Estudiantes", "number"], ["h", "Horario"]],
};
