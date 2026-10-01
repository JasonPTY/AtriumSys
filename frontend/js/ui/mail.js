/** Vista tipo correo (vista previa y detalle de mensajes). */
export const mail = (name, subject, to, message) =>
  `<div class="em"><div class="eh"><div class="av">${name.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div><div><b>${name}</b><br><small>Para: ${to}</small></div></div><h4>${subject}</h4><p>${message}</p><small>Enviado desde ATRIUM</small></div>`;
