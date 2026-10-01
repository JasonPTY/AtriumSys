// Estado mutable compartido de la interfaz (antes eran variables globales sueltas).
export const state = {
  role: "admin",          // admin | iadm | prof | est
  sec: "inicio",          // seccion activa del menu
  inst: "uni",            // clave de la institucion activa (antes CUR)
  instDraft: null,        // borrador del formulario de identidad (antes DR)
  openGroups: {},         // grupos del menu abiertos/cerrados (antes OP)
  profileEditing: false,  // modo edicion del perfil (antes PE)
  profileData: {},        // datos de perfil editados por rol (antes PD)
  session: null,          // sesion de asistencia en curso (antes SES)
  channels: { c: 1, p: 1 }, // canales del aviso: correo / notificacion (antes CH)
  newLogo: "",            // logo cargado en el modal "Nueva institucion" (antes NL)
};
