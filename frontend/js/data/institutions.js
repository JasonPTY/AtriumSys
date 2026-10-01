// Instituciones (multi-tenant). Persistidas en localStorage['atrium_inst'].
// Forma: { n, s, lema, web, mail, c1, c2, logo (data URL), adm, amail, act }
export const STORAGE_KEY = "atrium_inst";

export const INST = {
  uni: { n: "Universidad Nacional del Istmo", s: "UNI", lema: "Excelencia académica", web: "www.uni.edu", mail: "contacto@uni.edu", c1: "#1E3A8A", c2: "#10B981", logo: "" },
  col: { n: "Colegio Santa Lucía", s: "CSL", lema: "Formando con valores", web: "www.santalucia.edu", mail: "info@santalucia.edu", c1: "#7C2D12", c2: "#F59E0B", logo: "" },
};

// Mezcla lo guardado por el usuario sobre los valores por defecto.
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (saved) for (const k in saved) INST[k] = Object.assign(INST[k] || {}, saved[k]);
} catch (e) {}

// Administradores institucionales por defecto.
INST.uni.adm = INST.uni.adm || "Marta Solís";
INST.uni.amail = INST.uni.amail || "m.solis@uni.edu";
INST.col.adm = INST.col.adm || "Pedro Lara";
INST.col.amail = INST.col.amail || "p.lara@santalucia.edu";

export function persistInstitutions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INST));
  } catch (e) {}
}

// ---- Helpers de consulta ---------------------------------------------------
export const instKeys = () => Object.keys(INST);
export const instList = () => Object.values(INST);
export const isActive = (t) => t.act !== false;

/** Cifras globales de ejemplo por institucion: e=estudiantes, p=profesores, c=cursos, a=asistencia %. */
export const demoStats = (t) => {
  const h = [...t.n].reduce((a, c) => a + c.charCodeAt(0), 0);
  return { e: 300 + (h % 900), p: 20 + (h % 50), c: 10 + (h % 40), a: 80 + (h % 17) };
};

/** Suma de una cifra de demoStats sobre las instituciones activas. */
export const sumStat = (k) => instList().filter(isActive).reduce((a, t) => a + demoStats(t)[k], 0);

/** Asistencia promedio de las instituciones activas. */
export const avgAttendance = () => Math.round(sumStat("a") / Math.max(1, instList().filter(isActive).length));
