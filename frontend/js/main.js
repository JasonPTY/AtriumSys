// ATRIUM · punto de entrada.
// 1) publica en window las funciones usadas por atributos onclick/oninput del HTML generado,
// 2) registra las vistas de cada rol, 3) conecta los controles del layout y 4) arranca.
import { state } from "./core/state.js";
import { $ } from "./core/dom.js";
import { render, go, toggleGroup } from "./core/render.js";
import { applyTheme } from "./core/theme.js";
import { registerViews } from "./core/registry.js";
import { startClock } from "./core/clock.js";
import { switchInstitution } from "./data/school.js";
import { ic } from "./ui/icons.js";
import { toast } from "./ui/toast.js";
import { closeModal } from "./ui/modal.js";
import { bootAuth } from "./auth/index.js";

import { adminViews, adminHandlers } from "./views/admin";
import { iadmViews, iadmHandlers } from "./views/iadm";
import { profViews, profHandlers } from "./views/prof";
import { estViews, estHandlers } from "./views/est";
import { profileView, profileHandlers } from "./views/shared/profile.js";
import { historyHandlers } from "./views/shared/history.js";
import { composeHandlers } from "./views/shared/compose.js";
import { exportModal } from "./views/shared/export.js";

// ---- 1) API global para los handlers inline ---------------------------------
Object.assign(
  window,
  { toast, closeModal, go, toggleGroup, exportModal },
  historyHandlers,
  composeHandlers,
  profileHandlers,
  adminHandlers,
  iadmHandlers,
  profHandlers,
  estHandlers
);

// ---- 2) Vistas por rol (el perfil es comun) ----------------------------------
registerViews("admin", { ...adminViews, perfil: profileView });
registerViews("iadm", { ...iadmViews, perfil: profileView });
registerViews("prof", { ...profViews, perfil: profileView });
registerViews("est", { ...estViews, perfil: profileView });

// ---- 3) Controles del layout ---------------------------------------------------
$("burger").innerHTML = ic("menu");
$("bell").innerHTML = ic("bell") + '<span class="badge" id="bc"></span>';
$("burger").onclick = () => $("side").classList.toggle("open");
$("bell").onclick = () => go("notif");

// Los selectores "Institucion" y "Vista" de demostracion se reemplazaron por el login:
// el rol y la institucion salen de la sesion (ver js/auth/).

// ---- 4) Arranque -----------------------------------------------------------------
startClock();
bootAuth({
  onEnter: () => {
    applyTheme();
    render();
  },
});
