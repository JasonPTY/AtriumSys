import { card, table, kpi, progress } from "../../ui/components.js";
import { COURSES } from "../../data/courses.js";

export const estHome = () =>
  `<div class="grid">${kpi("Cursos inscritos", "5", "#1E3A8A", "book") + kpi("Asistencias registradas", "118", "#10B981", "check") + kpi("Ausencias", "9", "#EF4444", "clock") + kpi("Progreso general", "72%", "#3B5BC7", "chart")}</div>` +
  card("Mi asistencia por curso", table(["Curso", "Asistencias", "Porcentaje"], COURSES.map((c) => [c.name, Math.round(c.attendance * 0.28) + "/28", progress(c.attendance)]))) +
  `<br>` +
  card("Progreso del semestre", progress(72));
