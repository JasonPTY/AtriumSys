// Capa de acceso: modo demo (local) o API. Todas las funciones lanzan Error con .code:
// INVALID · LOCKED(until) · INST_INACTIVE · TOKEN_INVALID · TOKEN_EXPIRED · WEAK · SAME · ERROR
import { AUTH_MODE, MAX_TRIES, LOCK_MIN, TOKEN_MIN, DEMO_PASS, TEMP_PASS, DEMO_USERS } from "./config.js";
import { evaluate } from "./password.js";
import { INST, isActive } from "../data/institutions.js";
import * as store from "./session.js";

const err = (code, extra) => Object.assign(new Error(code), { code }, extra);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const api = AUTH_MODE === "api";

// ---- Modo API ---------------------------------------------------------------
const CODES = { 401: "INVALID", 403: "INST_INACTIVE", 423: "LOCKED", 429: "LOCKED" };
async function http(path, body, method = "POST") {
  const r = await fetch("/api/v1/auth" + path, {
    method, credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw err((d && d.code) || CODES[r.status] || "ERROR", d || {});
  return d;
}
const ROLES = { SUPER_ADMIN: "admin", INST_ADMIN: "iadm", TEACHER: "prof", STUDENT: "est" };
const fromApi = (d) => ({ user: { id: d.usuario || d.correo, email: d.correo, name: d.nombre, role: ROLES[d.rol], inst: d.institucionId == null ? null : String(d.institucionId), label: d.etiquetaRol || d.rol }, mustChange: !!d.debeCambiarPassword });

// ---- Modo demo (memoria + localStorage solo para intentos) ----------------------
const PW = Object.fromEntries(DEMO_USERS.map((u) => [u.email, { pass: u.must ? TEMP_PASS : DEMO_PASS, must: !!u.must }]));
const TOKENS = {};
const TK = "atrium_intentos";
const tries = () => { try { return JSON.parse(localStorage.getItem(TK) || "{}"); } catch (e) { return {}; } };
const saveTries = (t) => { try { localStorage.setItem(TK, JSON.stringify(t)); } catch (e) {} };
const find = (id) => DEMO_USERS.find((u) => u.email === id || u.id === id);
export const instBlocked = (u) => !!(u.inst && INST[u.inst] && !isActive(INST[u.inst]));

export async function login(id, pass, remember) {
  if (api) return fromApi(await http("/login", { usuario: id, password: pass, recordarme: remember }));
  await wait(500);
  const typed = id.trim().toLowerCase(), u = find(typed), key = u ? u.email : typed, T = tries(); // correo y usuario comparten contador
  let t = T[key] || { n: 0, until: 0 };
  if (t.until && t.until <= Date.now()) t = { n: 0, until: 0 };
  if (t.until > Date.now()) throw err("LOCKED", { until: t.until });
  if (!u || PW[u.email].pass !== pass) {
    t.n++;
    if (t.n >= MAX_TRIES) { T[key] = { n: 0, until: Date.now() + LOCK_MIN * 6e4 }; saveTries(T); throw err("LOCKED", { until: T[key].until }); }
    T[key] = t; saveTries(T);
    throw err("INVALID", { left: MAX_TRIES - t.n });
  }
  if (instBlocked(u)) throw err("INST_INACTIVE");
  delete T[key]; saveTries(T);
  store.save(u.email, remember);
  return { user: u, mustChange: PW[u.email].must };
}
export async function me() {
  if (api) return fromApi(await http("/me", null, "GET"));
  const email = store.load(), u = email && find(email);
  return u ? { user: u, mustChange: PW[u.email].must } : null;
}
export async function logout() { if (api) await http("/logout").catch(() => {}); store.clear(); }
export async function forgot(id) {
  if (api) { await http("/forgot-password", { usuario: id }).catch(() => {}); return {}; }
  await wait(500);
  const u = find(id.trim().toLowerCase()), token = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  if (u) TOKENS[token] = { email: u.email, exp: Date.now() + TOKEN_MIN * 6e4 };
  return { demoToken: token }; // en producción el enlace llega solo por correo
}
export async function reset(token, pass) {
  if (api) return http("/reset-password", { token, password: pass });
  await wait(400);
  const t = TOKENS[token];
  if (!t) throw err("TOKEN_INVALID");
  if (t.exp < Date.now()) throw err("TOKEN_EXPIRED");
  if (!evaluate(pass, t.email).ok) throw err("WEAK");
  PW[t.email] = { pass, must: false }; delete TOKENS[token];
  const T = tries(); delete T[t.email]; saveTries(T);
}
export async function change(email, current, pass) {
  if (api) return http("/change-password", { actual: current, nueva: pass });
  await wait(400);
  const rec = PW[email];
  if (!rec || (current !== null && rec.pass !== current)) throw err("INVALID");
  if (pass === rec.pass) throw err("SAME");
  if (!evaluate(pass, email).ok) throw err("WEAK");
  PW[email] = { pass, must: false };
}
