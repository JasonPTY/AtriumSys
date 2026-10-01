// Menu por rol: [clave, etiqueta, icono]
export const MENU = {
  admin: [
    ["inicio", "Inicio", "home"],
    ["insts", "Instituciones", "id"],
    ["admins", "Administradores", "users"],
    ["stats", "Estadísticas globales", "chart"],
    ["conf", "Configuración", "menu"],
    ["perfil", "Mi perfil", "user"],
  ],
  iadm: [
    ["inicio", "Inicio", "home"],
    ["usuarios", "Usuarios", "users"],
    ["profesores", "Profesores", "id"],
    ["estudiantes", "Estudiantes", "users"],
    ["cursos", "Cursos", "book"],
    ["grupos", "Grupos", "users"],
    ["hist", "Asistencias", "check"],
    ["monit", "Monitoreo", "chart"],
    ["reporte", "Reportes", "chart"],
    ["notif", "Notificaciones", "bell"],
    ["inst", "Mi institución", "id"],
    ["perfil", "Mi perfil", "user"],
  ],
  prof: [
    ["inicio", "Inicio", "home"],
    ["estudiantes", "Estudiantes", "users"],
    ["asist", "Asistencias", "check"],
    ["hist", "Historial", "clock"],
    ["notif", "Notificaciones", "bell"],
    ["reportes", "Reportes", "chart"],
    ["perfil", "Mi perfil", "user"],
  ],
  est: [
    ["inicio", "Inicio", "home"],
    ["clases", "Mis clases", "cal"],
    ["notif", "Mis notificaciones", "bell"],
    ["perfil", "Mi perfil", "user"],
  ],
};

// Agrupacion del sidebar: string = item suelto; [titulo, icono, [claves]] = grupo colapsable.
// El rol "est" no tiene grupos (se muestra el menu plano).
export const GROUPS = {
  admin: ["inicio", ["Instituciones", "id", ["insts", "admins"]], ["Plataforma", "chart", ["stats", "conf"]], "perfil"],
  iadm: [
    "inicio",
    ["Gestión", "users", ["usuarios", "profesores", "estudiantes"]],
    ["Académico", "book", ["cursos", "grupos"]],
    ["Asistencia", "check", ["hist", "monit"]],
    ["Análisis", "chart", ["reporte", "notif"]],
    "inst",
    "perfil",
  ],
  prof: ["inicio", ["Clases", "check", ["asist", "hist", "estudiantes"]], ["Seguimiento", "chart", ["reportes", "notif"]], "perfil"],
};
