import { ic } from "../../ui/icons.js";
import { card, table, statusPill, toastBtn } from "../../ui/components.js";

export const iadmUsers = () =>
  `<div class="acts"><button class="btn" onclick="toast('Usuario creado')">${ic("plus")}Nuevo usuario</button></div>` +
  card(
    "Cuentas del sistema",
    table(["Nombre", "Correo", "Rol", "Estado", "Acción"], [
      ["Laura Méndez", "laura.mendez@atrium.edu", "Administrador", statusPill("Activo"), toastBtn("Editar")],
      ["Carlos Rivas", "c.rivas@atrium.edu", "Profesor", statusPill("Activo"), toastBtn("Editar")],
      ["Ana Torres", "ana.torres@atrium.edu", "Estudiante", statusPill("Activo"), toastBtn("Editar")],
      ["Mario Gil", "m.gil@atrium.edu", "Profesor", statusPill("Pendiente"), toastBtn("Aprobar")],
      ["Sara Núñez", "s.nunez@atrium.edu", "Estudiante", statusPill("Suspendido"), toastBtn("Reactivar")],
    ])
  );
