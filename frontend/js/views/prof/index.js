import { profHome } from "./home.js";
import { profStudents } from "./students.js";
import { attendanceView, attendanceHandlers } from "./attendance.js";
import { historyView } from "../shared/history.js";
import { reportsView } from "../shared/reports.js";
import { composeView } from "../shared/compose.js";

export const profViews = {
  inicio: profHome,
  estudiantes: profStudents,
  asist: attendanceView,
  hist: historyView,
  notif: composeView,
  reportes: reportsView,
};

export const profHandlers = { ...attendanceHandlers };
