// Registro de vistas por rol. render() lee de aqui; main.js lo llena.
// Asi las vistas pueden importar render() sin crear dependencias circulares.
export const views = { admin: {}, iadm: {}, prof: {}, est: {} };

export function registerViews(role, map) {
  Object.assign(views[role], map);
}
