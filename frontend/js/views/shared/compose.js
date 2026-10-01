import { state } from "../../core/state.js";
import { $ } from "../../core/dom.js";
import { render } from "../../core/render.js";
import { USER, sentMessages } from "../../data/users.js";
import { ic } from "../../ui/icons.js";
import { card, btn } from "../../ui/components.js";
import { modal } from "../../ui/modal.js";
import { mail } from "../../ui/mail.js";
import { toast } from "../../ui/toast.js";

/** Redactor de avisos + vista previa + enviados (profesor y admin institucional). */
export function composeView() {
  const u = USER[state.role];
  const ch = state.channels;
  return (
    `<div class="grid g2"><div class="card"><h3>Nuevo mensaje</h3>` +
    `<div class="mrow"><label>Para</label><select id="nc" onchange="previewMessage()"><option>Todos mis estudiantes</option><option>Cálculo I · 42 estudiantes</option><option>Programación · 45 estudiantes</option></select></div>` +
    `<div class="mrow"><label>Asunto</label><input id="ns" oninput="previewMessage()" placeholder="Asunto del aviso"></div>` +
    `<div class="mrow"><label>Canal</label><div class="chs"><button class="tg2 ${ch.c ? "on" : ""}" onclick="toggleChannel('c',this)">Correo</button><button class="tg2 ${ch.p ? "on" : ""}" onclick="toggleChannel('p',this)">Notificación</button></div></div>` +
    `<textarea id="nm" rows="7" oninput="previewMessage()" placeholder="Escribe tu mensaje…"></textarea>` +
    `<div class="acts" style="margin:14px 0 0;justify-content:flex-end"><button class="btn o" onclick="toast('Borrador guardado')">Guardar borrador</button><button class="btn g" id="sb" onclick="sendMessage()">${ic("send")}Enviar</button></div></div>` +
    `<div class="card"><h3>Vista previa</h3><div class="em"><div class="eh"><div class="av">${u.initials}</div><div><b>${u.name}</b><br><small>Para: <span id="pt">Todos mis estudiantes</span></small></div></div><h4 id="ps">(Sin asunto)</h4><p id="pm">El mensaje aparecerá aquí.</p><small>Enviado desde ATRIUM</small></div></div></div>` +
    card(
      "Enviados",
      sentMessages
        .map((s, i) => `<div class="msg row" onclick="openSent(${i})"><div style="flex:1"><b>${s.s}</b><br><small>${s.c} · ${s.t}</small></div><span class="pill ok">Entregado</span></div>`)
        .join("")
    )
  );
}

function toggleChannel(key, el) {
  state.channels[key] = !state.channels[key];
  el.classList.toggle("on");
}

function previewMessage() {
  $("ps").textContent = $("ns").value || "(Sin asunto)";
  $("pm").textContent = $("nm").value || "El mensaje aparecerá aquí.";
  $("pt").textContent = $("nc").value;
}

/** Punto de integracion: enviar aviso / correo al backend. */
function sendMessage() {
  const subject = $("ns").value,
    body = $("nm").value,
    to = $("nc").value;
  if (!subject.trim() || !body.trim()) return toast("Completa asunto y mensaje");
  if (!state.channels.c && !state.channels.p) return toast("Elige al menos un canal");
  $("sb").disabled = true;
  $("sb").textContent = "Enviando…";
  setTimeout(() => {
    sentMessages.unshift({ s: subject, c: to, t: "Ahora", m: body });
    render();
    toast("Aviso enviado");
  }, 900);
}

function openSent(i) {
  const s = sentMessages[i];
  modal("Mensaje enviado", mail(USER[state.role].name, s.s, s.c, s.m), btn("Cerrar", "o", "closeModal()"));
}

export const composeHandlers = { toggleChannel, previewMessage, sendMessage, openSent };
