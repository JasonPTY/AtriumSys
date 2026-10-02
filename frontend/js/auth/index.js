// ATRIUM · punto de entrada de la autenticación.
// Decide si se muestra el login o la aplicación. El rol y la institución salen SIEMPRE de la sesión.
import * as svc from "./service.js";
import { initUI, enter, showLogin, showReset, showForce } from "./ui.js";

export async function bootAuth({ onEnter }) {
  initUI(onEnter);
  const m = /^#reset=([\w-]+)/.exec(location.hash);   // enlace de recuperación recibido por correo
  if (m) { history.replaceState(null, "", location.pathname + location.search); return showReset(m[1]); }
  let r = null;
  try { r = await svc.me(); } catch (e) {}
  if (!r) return showLogin();
  r.mustChange ? showForce(r.user) : enter(r.user);
}
