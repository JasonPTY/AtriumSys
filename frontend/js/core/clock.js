import { $ } from "./dom.js";

function tick() {
  const d = new Date();
  $("ck").textContent = d.toLocaleTimeString("es", { hour12: false });
  $("dt").textContent = d.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}

export function startClock() {
  tick();
  setInterval(tick, 1000);
}
