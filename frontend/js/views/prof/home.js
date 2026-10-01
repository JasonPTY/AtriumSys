import { ic } from "../../ui/icons.js";
import { card, table, kpi } from "../../ui/components.js";

export const profHome = () =>
  `<div class="acts"><button class="btn g" onclick="go('asist')">${ic("check")}Registrar asistencia</button><button class="btn" onclick="go('notif')">${ic("send")}Notificar</button><button class="btn o" onclick="go('hist')">${ic("clock")}Consultar historial</button></div>` +
  `<div class="grid">${kpi("Mis cursos", "2", "#1E3A8A", "book") + kpi("Estudiantes", "87", "#3B5BC7", "users") + kpi("Asistencias registradas", "1.940", "#10B981", "check") + kpi("Asistencia promedio", "95%", "#6366F1", "chart")}</div>` +
  card("Clases de hoy", table(["Hora", "Curso", "Aula", "Estado"], [["08:00", "Cálculo I", "A-101", '<span class="pill ok">Registrada</span>'], ["10:00", "Programación", "B-204", '<span class="pill wn">Pendiente</span>']]));
