// Graficas propias en SVG/CSS, sin librerias.

/** Barras verticales. data: [[etiqueta, valor 0-100], ...] */
export const bars = (data) => {
  const w = 300, h = 170;
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%"><g>${data
    .map((x, i) => {
      const bh = x[1] * 1.3,
        bx = 12 + (i * (w - 24)) / data.length,
        bw = (w - 24) / data.length - 10;
      return `<rect x="${bx}" y="${h - 22 - bh}" width="${bw}" height="${bh}" rx="4" fill="${x[1] >= 90 ? "#10B981" : x[1] >= 80 ? "#3B5BC7" : "#EF4444"}"/><text x="${bx + bw / 2}" y="${h - 6}" text-anchor="middle" font-size="10" fill="var(--mu)">${x[0]}</text><text x="${bx + bw / 2}" y="${h - 26 - bh}" text-anchor="middle" font-size="10" fill="var(--tx)">${x[1]}</text>`;
    })
    .join("")}</g></svg>`;
};

/** Dona presente / tardanza / ausente (a + b + c = 100). */
export const donut = (a, b, c) => {
  const t = a + b + c, r = 54, L = 2 * Math.PI * r;
  let o = 0;
  const seg = (v, color) => {
    const d = (v / t) * L;
    const e = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${color}" stroke-width="18" stroke-dasharray="${d} ${L - d}" stroke-dashoffset="${-o}" transform="rotate(-90 70 70)"/>`;
    o += d;
    return e;
  };
  return `<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><svg viewBox="0 0 140 140" width="140">${seg(a, "#10B981") + seg(b, "#F59E0B") + seg(c, "#EF4444")}<text x="70" y="76" text-anchor="middle" font-size="20" font-weight="700" fill="var(--tx)">${Math.round((a / t) * 100)}%</text></svg><div><div><span class="pill ok">Presente ${a}%</span></div><br><div><span class="pill wn">Tardanza ${b}%</span></div><br><div><span class="pill bad">Ausente ${c}%</span></div></div></div>`;
};

/** Mapa de calor 5 dias x 14 semanas (datos de ejemplo deterministas). */
export const heat = () => {
  let h = '<div class="heat">';
  for (let d = 0; d < 5; d++)
    for (let w = 0; w < 14; w++) {
      const v = (w * 7 + d * 13 + w * d) % 10;
      h += `<i title="${60 + v * 4}%" style="background:${v < 2 ? "var(--bad)" : `color-mix(in srgb,var(--ok) ${25 + v * 8}%,var(--bg))`}"></i>`;
    }
  return h + "</div>";
};

/** Anillo de progreso (perfil). */
export const ring = (p) =>
  `<svg viewBox="0 0 100 100" width="120"><circle cx="50" cy="50" r="42" fill="none" stroke="var(--bd)" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--ok)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${p * 2.64} 264" transform="rotate(-90 50 50)"/><text x="50" y="56" text-anchor="middle" font-weight="700" font-size="20" fill="var(--tx)">${p}%</text></svg>`;
