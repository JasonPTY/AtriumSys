// Sesión del navegador: persistencia con vencimiento, inactividad y cierre sincronizado entre pestañas.
// En modo "api" la sesión real es una cookie HttpOnly del servidor; aquí solo se guarda un marcador.
import { IDLE_MIN, WARN_SEC, REMEMBER_DAYS } from "./config.js";

const KEY = "atrium_session", OUT = "atrium_logout";
export const session = { user: null };

export function save(email, remember) {
  clear();
  const exp = Date.now() + (remember ? REMEMBER_DAYS * 864e5 : IDLE_MIN * 6e4 * 4);
  try { (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify({ email, exp })); } catch (e) {}
}
export function load() {
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    const s = raw && JSON.parse(raw);
    if (s && s.exp > Date.now()) return s.email;
  } catch (e) {}
  clear();
  return null;
}
export function clear() {
  try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {}
}
export const broadcastLogout = () => { try { localStorage.setItem(OUT, String(Date.now())); } catch (e) {} };
export const onRemoteLogout = (fn) => addEventListener("storage", (e) => e.key === OUT && fn());

const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];
let warnT, outT, handler;
export function startIdle(onWarn, onTimeout) {
  stopIdle();
  const reset = () => {
    clearTimeout(warnT); clearTimeout(outT);
    warnT = setTimeout(onWarn, (IDLE_MIN * 60 - WARN_SEC) * 1000);
    outT = setTimeout(onTimeout, IDLE_MIN * 6e4);
  };
  handler = reset;
  EVENTS.forEach((e) => addEventListener(e, handler, { passive: true }));
  reset();
}
export function stopIdle() {
  clearTimeout(warnT); clearTimeout(outT);
  if (handler) EVENTS.forEach((e) => removeEventListener(e, handler));
  handler = null;
}
