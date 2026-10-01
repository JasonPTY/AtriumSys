import { modal } from "../../ui/modal.js";
import { ic } from "../../ui/icons.js";

/** Modal de exportacion (PDF / Excel / CSV). Hoy solo muestra un aviso: conectar al backend. */
export function exportModal() {
  modal(
    "Exportar historial",
    `<p style="margin:0 0 12px;color:var(--mu)">Elige el formato del archivo.</p><div class="chs">${["PDF", "Excel", "CSV"]
      .map((f) => `<button class="tg2" onclick="closeModal();toast('Exportado como ${f}')">${ic("down")}&nbsp;${f}</button>`)
      .join("")}</div>`
  );
}
