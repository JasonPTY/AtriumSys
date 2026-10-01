import { ic } from "../../ui/icons.js";
import { card, table, pill } from "../../ui/components.js";
import { bars, donut, heat } from "../../ui/charts.js";
import { instList, isActive, demoStats, avgAttendance } from "../../data/institutions.js";

/** Estadisticas globales de la plataforma (cifras de ejemplo). */
export const statsView = () =>
  `<div class="hero"><div><small>Asistencia global de la plataforma</small><b>${avgAttendance()}%</b><span class="pill ok">${instList().filter(isActive).length} instituciones activas</span></div><button class="btn o" onclick="exportModal()">${ic("down")}Exportar</button></div>` +
  `<div class="grid g2">${card("Asistencia por institución", bars(instList().map((t) => [t.s, demoStats(t).a])))}${card("Distribución global", donut(87, 5, 8))}</div>` +
  `<div class="grid g2">${card("Mapa de asistencia · últimas 14 semanas", heat())}${card(
    "Ranking de instituciones",
    table(["Institución", "Estudiantes", "Asistencia"], instList().map((t) => [t.n, demoStats(t).e, pill(demoStats(t).a)]))
  )}</div>`;
