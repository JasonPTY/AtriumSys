import { state } from "./state.js";
import { $ } from "./dom.js";
import { MENU, GROUPS } from "./config.js";
import { views } from "./registry.js";
import { USER, NOTIFICATIONS } from "../data/users.js";
import { ic } from "../ui/icons.js";
import { card } from "../ui/components.js";

/** HTML del sidebar para el menu del rol activo (items sueltos y grupos colapsables). */
function navHtml(menu) {
  const item = (k) => {
    const m = menu.find((x) => x[0] == k);
    return `<button class="ni ${k == state.sec ? "on" : ""}" onclick="go('${k}')"><span class="ti">${ic(m[2])}</span><span class="lb">${m[1]}</span></button>`;
  };
  return (GROUPS[state.role] || menu.map((m) => m[0]))
    .map((e) => {
      if (typeof e == "string") return item(e);
      const open = state.openGroups[e[0]] !== false;
      return `<button class="gh ${open ? "op" : ""}" onclick="toggleGroup('${e[0]}')"><span class="ti">${ic(e[1])}</span><span class="lb">${e[0]}</span>${ic("chev", "cv")}</button><div class="ch" style="display:${open ? "block" : "none"}">${e[2].map(item).join("")}</div>`;
    })
    .join("");
}

/** Navega a una seccion del rol activo. */
export function go(sec) {
  state.sec = sec;
  render();
  $("side").classList.remove("open");
}

/** Abre / cierra un grupo del sidebar. */
export function toggleGroup(title) {
  state.openGroups[title] = state.openGroups[title] === false;
  render();
}

/** Vista de respaldo cuando una seccion no tiene vista registrada. */
const fallbackView = () =>
  card("Notificaciones", NOTIFICATIONS[state.role].map((s) => `<div class="msg"><b>${s.title}</b><br><small>${s.from} · ${s.when}</small></div>`).join(""));

/** Repinta sidebar, cabecera y vista activa a partir del estado. */
export function render() {
  const menu = MENU[state.role];
  const current = menu.find((m) => m[0] == state.sec) || menu[0];
  state.sec = current[0];

  $("nav").innerHTML = navHtml(menu);

  const u = USER[state.role];
  $("mav").textContent = u.initials;
  $("mnm").textContent = u.name;
  $("mrl").textContent = u.label;
  $("hi").textContent = "Hola, " + u.name.split(" ").slice(0, state.role == "prof" ? 2 : 1).join(" ") + " 👋";
  $("bc").textContent = NOTIFICATIONS[state.role].length;

  const view = views[state.role][state.sec] || fallbackView;
  $("view").innerHTML = `<h2 style="margin:0 0 16px;font-size:20px">${current[1]}</h2>` + view();
}
