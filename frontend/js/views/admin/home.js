import { card, table, kpi, pill } from "../../ui/components.js";
import { bars } from "../../ui/charts.js";
import { instList, isActive, demoStats, sumStat, avgAttendance } from "../../data/institutions.js";
import { institutionStatus } from "./institutions.js";

export const adminHome = () =>
  `<div class="grid">${kpi("Instituciones activas", instList().filter(isActive).length, "#1E3A8A", "id") + kpi("Estudiantes totales", sumStat("e").toLocaleString("es"), "#3B5BC7", "users") + kpi("Profesores", sumStat("p"), "#6366F1", "users") + kpi("Asistencia global", avgAttendance() + "%", "#10B981", "check")}</div>` +
  `<div class="grid g2">${card("Asistencia por institución (%)", bars(instList().map((t) => [t.s, demoStats(t).a])))}${card(
    "Estado de instituciones",
    table(["Institución", "Asistencia", "Estado"], instList().map((t) => [t.n, pill(demoStats(t).a), institutionStatus(t)]))
  )}</div>`;
