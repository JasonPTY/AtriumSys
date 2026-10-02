import { card, table, kpi, pill } from "../../ui/components.js";
import { bars } from "../../ui/charts.js";
import { COURSES } from "../../data/courses.js";

export const iadmHome = () =>
  `<div class="grid">${kpi("Estudiantes", "1.248", "#1E3A8A", "users") + kpi("Cursos activos", "42", "#3B5BC7", "book") + kpi("Profesores", "68", "#6366F1", "id") + kpi("Asistencia general", "97%", "#10B981", "check")}</div>` +
  `<div class="grid g2">${card("Asistencia por mes (%)", bars([["Ago", 93], ["Sep", 91], ["Oct", 88], ["Nov", 90], ["Dic", 85]]))}${card(
    "Cursos que requieren atención",
    table(["Curso", "%"], COURSES.filter((c) => c.attendance < 90).map((c) => [c.name, pill(c.attendance)]))
  )}</div>`;
