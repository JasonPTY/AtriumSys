// ATRIUM · Autenticación: configuración y cuentas de demostración.
// AUTH_MODE "demo" usa cuentas locales; "api" usa el backend (/api/v1/auth/*) con cookie de sesión HttpOnly.
export const AUTH_MODE = "demo";
export const MAX_TRIES = 5;      // intentos fallidos antes del bloqueo
export const LOCK_MIN = 15;      // minutos de bloqueo temporal
export const IDLE_MIN = 30;      // minutos de inactividad antes de cerrar sesión
export const WARN_SEC = 60;      // aviso previo al cierre por inactividad
export const REMEMBER_DAYS = 7;  // duración de "Recordarme"
export const TOKEN_MIN = 15;     // vigencia del enlace de recuperación
export const RESEND_SEC = 60;    // espera para reenviar el enlace
export const PASS_MIN = 10;      // largo mínimo de contraseña

export const DEMO_PASS = "Atrium2026!";
export const TEMP_PASS = "Temporal2026!"; // cuenta con cambio de contraseña obligatorio

// role: admin | iadm | prof | est   ·   inst: clave de institución (null = plataforma)
export const DEMO_USERS = [
  { id: "lmendez", email: "laura.mendez@atrium.edu", role: "admin", inst: null, name: "Laura Méndez", label: "Administrador general" },
  { id: "msolis", email: "m.solis@atrium.edu", role: "iadm", inst: "uni", name: "Marta Solís", label: "Admin institucional" },
  { id: "plara", email: "p.lara@santalucia.edu", role: "iadm", inst: "col", name: "Pedro Lara", label: "Admin institucional", must: true },
  { id: "crivas", email: "c.rivas@atrium.edu", role: "prof", inst: "uni", name: "Dr. Carlos Rivas", label: "Profesor" },
  { id: "atorres", email: "ana.torres@atrium.edu", role: "est", inst: "uni", name: "Ana Torres", label: "Estudiante" },
];
