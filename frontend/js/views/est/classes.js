import { card, table } from "../../ui/components.js";

export const estClasses = () =>
  `<div class="grid g2">${card(
    "Semana actual",
    `<div class="cal"><div><b>Lun</b><em>08:00 Cálculo</em></div><div><b>Mar</b><em>10:00 Programación</em><em>14:00 Física</em></div><div><b>Mié</b><em>08:00 Cálculo</em></div><div><b>Jue</b><em>09:00 Química</em><em>10:00 Programación</em></div><div><b>Vie</b><em>11:00 Historia</em></div></div>`
  )}${card("Próximas clases", table(["Cuándo", "Curso", "Aula"], [["Hoy 10:00", "Programación", "B-204"], ["Mañana 08:00", "Cálculo I", "A-101"], ["Jue 09:00", "Química", "L-2"]]))}</div>`;
