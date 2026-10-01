// Usuarios demo por rol (sustituir por la sesion real) y bandejas de notificaciones.
export const USER = {
  admin: { name: "Laura Méndez", label: "Administrador general", initials: "LM", email: "laura.mendez@atrium.edu" },
  iadm: { name: "Marta Solís", label: "Admin institucional", initials: "MS", email: "m.solis@atrium.edu" },
  prof: { name: "Dr. Carlos Rivas", label: "Profesor", initials: "CR", email: "c.rivas@atrium.edu" },
  est: { name: "Ana Torres", label: "Estudiante", initials: "AT", email: "ana.torres@atrium.edu" },
};

// Notificaciones por rol: { title, from, when }
export const NOTIFICATIONS = {
  est: [
    { title: "Nuevo horario de tutoría", from: "Dr. Rivas", when: "Hoy 09:10" },
    { title: "Tienes 2 inasistencias en Química", from: "Sistema", when: "Ayer" },
    { title: "Entrega del laboratorio 3", from: "Dra. Salas", when: "Lun" },
  ],
  prof: [
    { title: "3 estudiantes bajo 75% de asistencia", from: "Sistema", when: "Hoy" },
    { title: "Aula cambiada: PRG-110 en B-204", from: "Administración", when: "Ayer" },
  ],
  admin: [
    { title: "Cierre de inscripciones en 3 días", from: "Sistema", when: "Hoy" },
    { title: "2 solicitudes de cuenta pendientes", from: "Sistema", when: "Ayer" },
  ],
  iadm: [{ title: "Periodo 2026-II habilitado", from: "Sistema", when: "Hoy" }],
};

// Avisos enviados por profesor / admin institucional: { s: asunto, c: destino, t: cuando, m: mensaje }
export const sentMessages = [
  {
    s: "Recordatorio: examen parcial el viernes",
    c: "Cálculo I",
    t: "Hace 2 h",
    m: "Hola a todos, recuerden que el examen parcial es el viernes a las 8:00 en el aula A-101.",
  },
];
