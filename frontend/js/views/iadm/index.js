import { iadmHome } from "./home.js";
import { iadmUsers } from "./users.js";
import { monitoringView } from "./monitoring.js";
import { identityView, identityHandlers } from "./identity.js";
import { crudViews, crudHandlers } from "../shared/crud.js";
import { historyView } from "../shared/history.js";
import { reportsView } from "../shared/reports.js";
import { composeView } from "../shared/compose.js";

export const iadmViews = {
  inicio: iadmHome,
  usuarios: iadmUsers,
  ...crudViews, // profesores, estudiantes, cursos, grupos
  hist: historyView,
  monit: monitoringView,
  reporte: reportsView,
  inst: identityView,
  notif: composeView,
};

export const iadmHandlers = { ...identityHandlers, ...crudHandlers };
