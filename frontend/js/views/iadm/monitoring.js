import { card, table, kpi, pill, toastBtn } from "../../ui/components.js";
import { COURSES } from "../../data/courses.js";

export const monitoringView = () =>
  `<div class="grid">${kpi("En seguimiento", "37", "#F59E0B", "users") + kpi("Asistencia semanal", "92%", "#10B981", "check") + kpi("Alertas activas", "5", "#EF4444", "bell")}</div>` +
  `<div class="grid g2">${card(
    "Estudiantes en seguimiento",
    table(["Estudiante", "Curso", "Asistencia", "Acción"], [
      ["Camila Ríos", "Programación", pill(71), toastBtn("Notificar")],
      ["Diego Soto", "Química", pill(68), toastBtn("Notificar")],
      ["Sara Núñez", "Física II", pill(73), toastBtn("Notificar")],
    ])
  )}${card(
    "Cursos bajo la meta (90%)",
    table(["Curso", "Profesor", "Asistencia"], COURSES.filter((c) => c.attendance < 90).map((c) => [c.name, c.prof, pill(c.attendance)]))
  )}</div>`;
