import { card } from "../../ui/components.js";

/** Configuracion de la plataforma (solo maqueta: conectar al backend). */
export const settingsView = () =>
  `<div class="grid g2">${card(
    "Parámetros generales",
    `<div class="mrow"><label>Periodo vigente</label><input value="2026-II"></div><div class="mrow"><label>Asistencia mínima (%)</label><input type="number" value="75"></div><div class="mrow"><label>Idioma</label><select><option>Español</option><option>English</option></select></div><div class="mrow"><label>Zona horaria</label><select><option>América/Panamá</option><option>América/Bogotá</option></select></div>`
  )}${card(
    "Opciones de la plataforma",
    ["Permitir registro de nuevas instituciones", "Notificaciones por correo", "Modo mantenimiento"]
      .map((t, i) => `<label class="sw"><span>${t}</span><input type="checkbox" ${i < 2 ? "checked" : ""}><i></i></label>`)
      .join("") + `<div class="acts" style="margin:16px 0 0;justify-content:flex-end"><button class="btn g" onclick="toast('Configuración guardada')">Guardar cambios</button></div>`
  )}</div>`;
