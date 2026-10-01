import { NOTIFICATIONS } from "../../data/users.js";
import { card, btn } from "../../ui/components.js";
import { modal } from "../../ui/modal.js";
import { mail } from "../../ui/mail.js";

/** Bandeja de entrada del estudiante (las 2 primeras aparecen como no leidas). */
export const estInbox = () =>
  card(
    "Bandeja de entrada",
    NOTIFICATIONS.est
      .map(
        (s, i) =>
          `<div class="msg row" onclick="openInbox(${i})">${i < 2 ? '<span class="dot"></span>' : '<span style="width:8px"></span>'}<div class="av" style="width:34px;height:34px;font-size:12px">${s.from[0]}</div><div style="flex:1"><b>${s.title}</b><br><small>${s.from} · ${s.when}</small></div></div>`
      )
      .join("")
  );

function openInbox(i) {
  const s = NOTIFICATIONS.est[i];
  modal(s.title, mail(s.from, s.title, "Ana Torres", "Hola Ana, te escribimos para informarte sobre este asunto. Revisa los detalles en tu panel de clases."), btn("Cerrar", "o", "closeModal()"));
}

export const inboxHandlers = { openInbox };
