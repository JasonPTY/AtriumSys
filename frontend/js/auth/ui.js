// Pantallas de acceso: inicio de sesión, recuperación, restablecimiento, cambio obligatorio y cambio de contraseña.
import { state } from "../core/state.js";
import { $ } from "../core/dom.js";
import { USER } from "../data/users.js";
import { switchInstitution } from "../data/school.js";
import { ic } from "../ui/icons.js";
import { modal, closeModal } from "../ui/modal.js";
import { toast } from "../ui/toast.js";
import { AUTH_MODE, MAX_TRIES, LOCK_MIN, IDLE_MIN, WARN_SEC, RESEND_SEC, PASS_MIN, TOKEN_MIN, DEMO_USERS, DEMO_PASS } from "./config.js";
import * as svc from "./service.js";
import * as sess from "./session.js";
import { evaluate, meterHtml } from "./password.js";
import { can, firstSection } from "./permissions.js";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const P = { mail: "M3 5h18v14H3zM3 7l9 6 9-6", lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4", key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4", eyeoff: "M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.1A10.6 10.6 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-3.2 4.2M6.1 6.1A18 18 0 0 0 1 12s4 7 11 7a10.6 10.6 0 0 0 4-.8", logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9", alert: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" };
const ai = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n]}"/></svg>`;

let onEnter = () => {}, ctx = {}, timer;
const card = () => $("au-card");

// ---- Piezas -------------------------------------------------------------------
const field = (id, label, { type = "text", ac = "off", ph = "", icon = "", eye = false, extra = "" } = {}) =>
  `<div class="au-f"><label for="${id}">${label}</label><div class="au-in">${icon ? ai(icon) : ""}<input id="${id}" type="${type}" autocomplete="${ac}" placeholder="${ph}" aria-describedby="${id}-e" ${extra}>${eye ? `<button type="button" class="au-eye" data-act="eye" data-for="${id}" aria-label="Mostrar contraseña" aria-pressed="false">${ic("eye")}</button>` : ""}</div><small class="au-err" id="${id}-e" role="alert" hidden></small></div>`;
const alertBox = (type, msg) => (msg ? `<div class="au-alert ${type}" role="${type == "err" ? "alert" : "status"}">${ai(type == "err" ? "alert" : "shield")}<span>${msg}</span></div>` : "");
const setErr = (id, msg) => {
  const i = $(id), e = $(id + "-e");
  if (!i || !e) return;
  e.textContent = msg || ""; e.hidden = !msg;
  i.setAttribute("aria-invalid", msg ? "true" : "false");
  i.closest(".au-in").classList.toggle("bad", !!msg);
};
const busy = (b, label) => { const x = $("au-submit"); if (x) { x.disabled = b; x.innerHTML = b ? '<span class="au-spin"></span>Procesando…' : label; } };
const head = (title, sub, icon = "lock") => `<div class="au-ic">${ai(icon)}</div><h1>${title}</h1><p class="au-sub">${sub}</p>`;
const pwBlock = (idNew, idRep, meterId) => field(idNew, "Nueva contraseña", { type: "password", ac: "new-password", eye: true, extra: `data-pw="${meterId}"` }) + `<div id="${meterId}" class="au-pwm">${meterHtml(evaluate(""))}</div>` + field(idRep, "Confirmar contraseña", { type: "password", ac: "new-password", eye: true });
const MSG = {
  INST_INACTIVE: "Tu institución está desactivada. Contacta al administrador de la plataforma.",
  TOKEN_INVALID: "El enlace no es válido o ya fue usado.", TOKEN_EXPIRED: "El enlace expiró. Solicita uno nuevo.",
  WEAK: "La contraseña no cumple los requisitos.", SAME: "La nueva contraseña debe ser distinta de la actual.", ERROR: "No pudimos completar la acción. Intenta de nuevo.",
};

// ---- Vistas -------------------------------------------------------------------
function view(name, o = {}) {
  clearInterval(timer);
  ctx = { ...ctx, view: name, ...o };
  const html = { login: vLogin, forgot: vForgot, sent: vSent, reset: vReset, force: vForce }[name](o);
  card().innerHTML = html;
  card().dataset.view = name;
  const f = card().querySelector("input"); if (f && !o.noFocus) f.focus();
  if (o.until) countdown(o.until);
}
function vLogin(o) {
  const locked = o.until && o.until > Date.now();
  return head("Inicia sesión", "Accede con tu correo institucional o tu usuario.") +
    (locked ? alertBox("err", `Demasiados intentos. Acceso bloqueado por seguridad. Podrás intentar de nuevo en <b id="au-cd"></b>.`) : alertBox(o.type || "info", o.msg)) +
    `<form id="au-login" novalidate>${field("au-u", "Correo o usuario", { ac: "username", ph: "nombre@institucion.edu", icon: "mail", extra: `value="${esc(o.id || "")}" autocapitalize="none" spellcheck="false" ${locked ? "disabled" : ""}` })}` +
    field("au-p", "Contraseña", { type: "password", ac: "current-password", icon: "lock", eye: true, extra: locked ? "disabled" : "" }) +
    `<div class="au-caps" id="au-caps" hidden>${ai("alert")}Bloq Mayús está activado</div>` +
    `<div class="au-row"><label class="au-chk"><input type="checkbox" id="au-r" ${locked ? "disabled" : ""}> Recordarme</label><button type="button" class="au-link" data-act="forgot">¿Olvidaste tu contraseña?</button></div>` +
    `<button class="au-btn" id="au-submit" type="submit" ${locked ? "disabled" : ""}>Iniciar sesión</button></form>` +
    (AUTH_MODE == "demo" ? `<details class="au-demo"><summary>Accesos de demostración</summary><p>Contraseña: <b>${DEMO_PASS}</b></p><div>${DEMO_USERS.map((u) => `<button type="button" data-act="demo" data-u="${u.id}">${u.label}${u.inst && u.inst != "uni" ? " (CSL)" : ""}</button>`).join("")}</div></details>` : "");
}
const vForgot = (o) => head("Recupera tu acceso", "Ingresa tu correo o usuario y te enviaremos un enlace para crear una nueva contraseña.", "mail") +
  `<form id="au-forgot" novalidate>${field("au-u", "Correo o usuario", { ac: "username", icon: "mail", extra: `value="${esc(o.id || "")}"` })}<button class="au-btn" id="au-submit" type="submit">Enviar enlace</button></form><button class="au-link c" data-act="back">← Volver a iniciar sesión</button>`;
const vSent = (o) => head("Revisa tu correo", `Si la cuenta existe, te enviamos un enlace que vence en ${TOKEN_MIN} minutos. Revisa también tu carpeta de spam.`, "mail") +
  `<button class="au-btn o" data-act="resend" id="au-resend" disabled>Reenviar enlace (<span id="au-rs">${RESEND_SEC}</span>s)</button>` +
  (o.demoToken ? `<button class="au-btn" data-act="demoreset" data-t="${o.demoToken}">Abrir enlace de demostración</button>` : "") + `<button class="au-link c" data-act="back">← Volver a iniciar sesión</button>`;
const vReset = (o) => head("Crea una nueva contraseña", "Elige una contraseña segura que no uses en otros sitios.", "key") + alertBox("err", o.msg) +
  `<form id="au-reset" novalidate>${pwBlock("au-n", "au-c", "au-m")}<button class="au-btn" id="au-submit" type="submit">Guardar contraseña</button></form><button class="au-link c" data-act="forgot">Solicitar un nuevo enlace</button>`;
const vForce = (o) => head("Cambia tu contraseña", "Por seguridad debes reemplazar la contraseña temporal antes de continuar.", "key") + alertBox("err", o.msg) +
  `<form id="au-force" novalidate>${pwBlock("au-n", "au-c", "au-m")}<button class="au-btn" id="au-submit" type="submit">Guardar y continuar</button></form><button class="au-link c" data-act="cancel">Cancelar y salir</button>`;

function countdown(until) {
  const tick = () => {
    const s = Math.max(0, Math.ceil((until - Date.now()) / 1000)), el = $("au-cd");
    if (el) el.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    if (!s) view("login", { type: "info", msg: "Ya puedes intentar de nuevo." });
  };
  tick(); timer = setInterval(tick, 1000);
}
function resendTimer() {
  let s = RESEND_SEC;
  timer = setInterval(() => { s--; const b = $("au-resend"), t = $("au-rs"); if (t) t.textContent = s; if (s <= 0) { clearInterval(timer); if (b) { b.disabled = false; b.textContent = "Reenviar enlace"; } } }, 1000);
}

// ---- Acciones -------------------------------------------------------------------
async function submitLogin() {
  const id = $("au-u").value.trim(), pw = $("au-p").value;
  setErr("au-u", id ? "" : "Ingresa tu correo o usuario."); setErr("au-p", pw ? "" : "Ingresa tu contraseña.");
  if (!id || !pw) return (id ? $("au-p") : $("au-u")).focus();
  busy(true);
  try { const r = await svc.login(id, pw, $("au-r").checked); r.mustChange ? (ctx.pending = r.user, view("force")) : enter(r.user); }
  catch (e) {
    if (e.code == "LOCKED") return view("login", { id, until: e.until || Date.now() + LOCK_MIN * 6e4 });
    const msg = e.code == "INVALID" ? "Correo/usuario o contraseña incorrectos." + (e.left != null && e.left <= 2 ? ` Te quedan ${e.left} intento${e.left == 1 ? "" : "s"} antes de un bloqueo de ${LOCK_MIN} minutos.` : "") : MSG[e.code] || MSG.ERROR;
    view("login", { id, type: "err", msg, noFocus: true }); $("au-p").focus();
  }
}
async function submitForgot() {
  const id = $("au-u").value.trim();
  if (!id) return setErr("au-u", "Ingresa tu correo o usuario.");
  busy(true);
  const r = await svc.forgot(id);
  view("sent", { id, demoToken: r.demoToken, noFocus: true }); resendTimer();
}
async function submitNewPassword(kind) {
  const n = $("au-n").value, c = $("au-c").value, who = (ctx.pending && ctx.pending.email) || ctx.email || "";
  const r = evaluate(n, who);
  setErr("au-n", r.ok ? "" : "La contraseña no cumple los requisitos."); setErr("au-c", c === n ? "" : "Las contraseñas no coinciden.");
  if (!r.ok || c !== n) return;
  busy(true);
  try {
    if (kind == "reset") { await svc.reset(ctx.token, n); view("login", { type: "info", msg: "Contraseña actualizada. Ya puedes iniciar sesión.", noFocus: false }); }
    else { await svc.change(ctx.pending.email, null, n); toast("Contraseña actualizada"); enter(ctx.pending); }
  } catch (e) { const msg = MSG[e.code] || MSG.ERROR; kind == "reset" ? view("reset", { token: ctx.token, msg }) : view("force", { msg }); }
}

export function enter(u) {
  if (svc.instBlocked(u)) { sess.clear(); return view("login", { type: "err", msg: MSG.INST_INACTIVE }); }
  USER[u.role] = { name: u.name, label: u.label, initials: u.name.split(" ").filter((x) => !/^(Dr|Dra|Prof)\.?$/.test(x)).map((x) => x[0]).slice(0, 2).join("").toUpperCase(), email: u.email };
  delete state.profileData[u.role];
  Object.assign(state, { role: u.role, sec: "inicio", profileEditing: false, instDraft: null, session: null });
  if (u.inst && u.inst !== state.inst) switchInstitution(u.inst);
  if (!can(u.role, state.sec)) state.sec = firstSection(u.role);
  sess.session.user = u; ctx = {};
  document.body.classList.remove("guest"); $("side").classList.remove("open");
  actions(); onEnter();
  sess.startIdle(() => modal("¿Sigues ahí?", `<p style="margin:0">Por inactividad tu sesión se cerrará en ${WARN_SEC} segundos.</p>`, `<button class="btn g" onclick="closeModal()">Seguir conectado</button>`), () => logout("idle"));
}
export async function logout(reason = "manual", remote = false) {
  sess.stopIdle(); closeModal(); clearInterval(timer);
  if (!remote) { await svc.logout(); sess.broadcastLogout(); }
  sess.session.user = null; ctx = {};
  Object.assign(state, { profileEditing: false, instDraft: null, session: null, sec: "inicio" });
  document.body.classList.add("guest");
  const m = { idle: ["info", `Tu sesión se cerró por inactividad (${IDLE_MIN} min).`], remote: ["info", "Cerraste sesión en otra pestaña."], manual: ["ok", "Cerraste sesión correctamente."] }[reason];
  view("login", { type: m[0], msg: m[1] });
}

// ---- Cambio de contraseña (usuario autenticado) ---------------------------------------
window.authChange = () => modal("Cambiar contraseña", `<form id="au-change" novalidate class="au-mform" onsubmit="return false">${field("cp_cur", "Contraseña actual", { type: "password", ac: "current-password", eye: true })}${pwBlock("cp_new", "cp_rep", "cp_m")}<div class="au-alert err" id="cp_msg" hidden></div></form>`, `<button class="btn o" onclick="closeModal()">Cancelar</button><button class="btn g" onclick="authChangeSubmit()">Actualizar contraseña</button>`);
window.authChangeSubmit = async () => {
  const cur = $("cp_cur").value, n = $("cp_new").value, c = $("cp_rep").value, email = sess.session.user.email, r = evaluate(n, email);
  setErr("cp_cur", cur ? "" : "Ingresa tu contraseña actual."); setErr("cp_new", r.ok ? "" : "La contraseña no cumple los requisitos."); setErr("cp_rep", c === n ? "" : "Las contraseñas no coinciden.");
  if (!cur || !r.ok || c !== n) return;
  try { await svc.change(email, cur, n); closeModal(); toast("Contraseña actualizada"); }
  catch (e) { setErr("cp_cur", e.code == "INVALID" ? "La contraseña actual es incorrecta." : ""); if (e.code != "INVALID") { const m = $("cp_msg"); m.textContent = MSG[e.code] || MSG.ERROR; m.hidden = false; } }
};

function actions() {
  if ($("au-acts")) return;
  document.querySelector(".me").insertAdjacentHTML("beforeend", `<div class="au-acts" id="au-acts"><button class="ib" id="au-pw" title="Cambiar contraseña" aria-label="Cambiar contraseña">${ai("key")}</button><button class="ib" id="au-out" title="Cerrar sesión" aria-label="Cerrar sesión">${ai("logout")}</button></div>`);
  $("au-pw").onclick = () => window.authChange(); $("au-out").onclick = () => logout("manual");
}

// ---- Arranque -----------------------------------------------------------------------
export function initUI(cb) {
  onEnter = cb;
  $("auth").innerHTML = `<div class="au-bg" aria-hidden="true"></div>` +
    `<div class="au-wrap"><div class="au-brand"><span class="au-mark">A</span><b>ATRI<i>UM</i></b></div><section class="au-card" id="au-card" aria-live="polite"></section><p class="au-foot">© 2026 ATRIUM · v1.0.0 · <a href="#">Ayuda</a> · <a href="#">Privacidad</a></p></div>`;
  const a = $("auth");
  a.addEventListener("submit", (e) => { e.preventDefault(); ({ "au-login": submitLogin, "au-forgot": submitForgot, "au-reset": () => submitNewPassword("reset"), "au-force": () => submitNewPassword("force") })[e.target.id]?.(); });
  a.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const act = b.dataset.act, id = $("au-u") ? $("au-u").value : "";
    if (act == "eye") { const i = $(b.dataset.for), s = i.type == "password"; i.type = s ? "text" : "password"; b.innerHTML = s ? ai("eyeoff") : ic("eye"); b.setAttribute("aria-pressed", s); b.setAttribute("aria-label", s ? "Ocultar contraseña" : "Mostrar contraseña"); }
    else if (act == "forgot") view("forgot", { id });
    else if (act == "back") view("login", { id });
    else if (act == "demo") { const u = DEMO_USERS.find((x) => x.id == b.dataset.u); $("au-u").value = u.email; $("au-p").value = u.must ? "Temporal2026!" : DEMO_PASS; $("au-p").focus(); }
    else if (act == "demoreset") view("reset", { token: b.dataset.t });
    else if (act == "resend") { svc.forgot(ctx.id || "").then(() => { b.disabled = true; resendTimer(); toast("Enlace reenviado"); }); }
    else if (act == "cancel") logout("manual");
  });
  a.addEventListener("keyup", (e) => { if (e.target.id == "au-p" && e.getModifierState) $("au-caps").hidden = !e.getModifierState("CapsLock"); });
  document.addEventListener("input", (e) => {
    const m = e.target.dataset && e.target.dataset.pw; if (!m) return;
    const who = (ctx.pending && ctx.pending.email) || (sess.session.user && sess.session.user.email) || "";
    $(m).innerHTML = meterHtml(evaluate(e.target.value, who));
  });
  sess.onRemoteLogout(() => sess.session.user && logout("remote", true));
}
export const showLogin = (o) => view("login", o);
export const showReset = (token) => view("reset", { token });
export const showForce = (user) => { ctx.pending = user; view("force"); };
