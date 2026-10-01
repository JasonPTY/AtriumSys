import { ic } from "../../ui/icons.js";
import { card, table, kpi, pill, progress } from "../../ui/components.js";
import { donut, heat } from "../../ui/charts.js";
import { COURSES } from "../../data/courses.js";

/** Reportes de asistencia (admin institucional y profesor). */
export const reportsView = () =>
  `<div class="hero"><div><small>Asistencia global del periodo</small><b>91,4%</b><span class="pill ok">▲ 2,1% vs. periodo anterior</span></div><button class="btn o" onclick="exportModal()">${ic("down")}Exportar</button></div>` +
  `<div class="grid">${kpi("Sesiones dictadas", "1.204", "#1E3A8A", "cal") + kpi("Ausencias", "312", "#EF4444", "clock") + kpi("Estudiantes en riesgo", "37", "#F59E0B", "users")}</div>` +
  `<div class="grid g2">${card("Mapa de asistencia · últimas 14 semanas", heat())}${card("Distribución", donut(88, 4, 8))}</div>` +
  `<div class="grid g2">${card("Asistencia por curso", COURSES.map((c) => `<div class="hb"><span>${c.name}</span>${progress(c.attendance)}</div>`).join(""))}${card(
    "Estudiantes en riesgo",
    table(["Estudiante", "Curso", "%"], [["Camila Ríos", "Programación", pill(71)], ["Diego Soto", "Química", pill(68)], ["Sara Núñez", "Física II", pill(73)]])
  )}</div>`;
