// Acceso según rol: la única fuente de verdad es el menú del rol.
import { MENU } from "../core/config.js";

export const can = (role, sec) => !!MENU[role] && MENU[role].some((m) => m[0] === sec);
export const firstSection = (role) => MENU[role][0][0];
