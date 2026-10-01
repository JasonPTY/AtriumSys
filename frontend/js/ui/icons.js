const PATHS = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  users: "M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M21 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5",
  check: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  cal: "M3 6h18v15H3zM3 10h18M8 2v4M16 2v4",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  menu: "M3 6h18M3 12h18M3 18h18",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4z",
  plus: "M12 5v14M5 12h14",
  id: "M3 5h18v14H3zM7 10h4M7 14h6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  down: "M12 3v12M7 10l5 5 5-5M4 21h16",
  chev: "M6 9l6 6 6-6",
};

/** Devuelve el SVG inline de un icono. `extra` agrega clases (p. ej. "cv"). */
export const ic = (name, extra = "") =>
  `<svg class="i${extra ? " " + extra : ""}" viewBox="0 0 24 24"><path d="${PATHS[name]}"/></svg>`;
