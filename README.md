# ATRIUM · Plataforma de seguimiento y monitoreo de asistencia

Frontend estático (HTML + CSS + JavaScript vanilla con **módulos ES**, sin framework ni dependencias de ejecución).
Única dependencia externa: la fuente Inter de Google Fonts (con fallback a Roboto/system-ui).

## Ejecutar
Los módulos ES no cargan desde `file://`, así que sirve la carpeta con cualquier servidor estático:

    npm start            # = npx serve .
    # o: python3 -m http.server

Para abrirlo con doble clic (sin servidor) usa `frontend`, la misma app empaquetada en un solo archivo.

## Estructura

    atrium-project/
    ├── index.html                 Esqueleto: sidebar, header, #view, footer
    ├── atrium-standalone.html     Build de un solo archivo (generado, no editar)
    ├── package.json               scripts: start, build
    ├── scripts/
    │   └── build-standalone.mjs   Empaqueta index.html + css/ + js/ -> atrium-standalone.html
    ├── css/                       ORDEN = cascada original (main.css los importa en orden)
    │   ├── main.css
    │   ├── 01-tokens.css          variables, modo oscuro, safe-area
    │   ├── 02-base.css            reset, body, iconos
    │   ├── 03-shell.css           sidebar, header, controles, reloj
    │   ├── 04-components.css      grid, card, tablas, pills, botones, toast
    │   ├── 05-refinements.css     sobrescribe 03/04 (degradados, KPI, hero, heat)
    │   ├── 06-screens.css         asistencia, perfil, switches, modales, correo
    │   ├── 07-navigation.css      nav agrupada, kv, media queries de tablet/móvil
    │   └── 08-institution-responsive.css   identidad institucional + móvil ≤860px
    └── js/
        ├── main.js                Entrada: publica handlers en window, registra vistas, arranca
        ├── core/
        │   ├── state.js           Estado compartido (role, sec, inst, session, ...)
        │   ├── config.js          MENU y GROUPS por rol
        │   ├── registry.js        Registro de vistas por rol (evita imports circulares)
        │   ├── render.js          render(), go(), toggleGroup(), sidebar
        │   ├── theme.js           Marca de la institución (logo, nombre, título)
        │   ├── clock.js           Reloj del header
        │   └── dom.js             $ = getElementById
        ├── data/                  Datos de ejemplo + estado de datos
        │   ├── courses.js         COURSES
        │   ├── users.js           USER, NOTIFICATIONS, sentMessages
        │   ├── institutions.js    INST (+ localStorage), helpers y cifras demo
        │   └── school.js          db (prof/est/cur/grp/hist), STORE, switchInstitution, esquema CRUD
        ├── ui/                    Piezas reutilizables (devuelven HTML)
        │   ├── icons.js  components.js  charts.js  modal.js  toast.js  mail.js
        └── views/
            ├── shared/            history, reports, compose, crud, profile, export
            ├── admin/             home, institutions, admins, stats, settings
            ├── iadm/              home, users, monitoring, identity
            ├── prof/              home, students, attendance
            └── est/               home, classes, inbox
            (cada carpeta tiene index.js que exporta `xxxViews` y `xxxHandlers`)

Flujo: `main.js` registra las vistas de cada rol -> `render()` busca `views[role][sec]` y pinta en `#view`.
Cada handler modifica el estado en memoria y llama a `render()`.

## Roles (selector "Vista" del header; reemplazar por tu login)
| Clave  | Rol                     | Alcance |
|--------|-------------------------|---------|
| `admin`| Administrador general   | Instituciones (crear, editar, activar/desactivar), administradores institucionales, estadísticas globales, configuración |
| `iadm` | Administrador institucional | Su institución: usuarios, profesores, estudiantes, cursos, grupos, asistencias, monitoreo, reportes, notificaciones, identidad |
| `prof` | Profesor                | Estudiantes, crear/registrar asistencia, historial, notificaciones, reportes |
| `est`  | Estudiante              | Inicio, clases, notificaciones, perfil |

El selector "Institución" simula a qué institución pertenece el usuario. En producción sale de la sesión.

## Datos de ejemplo (sustituir por tu API)
| Antes | Ahora | Contenido |
|-------|-------|-----------|
| `INST` | `data/institutions.js` → `INST` | Instituciones; persistidas en `localStorage['atrium_inst']` |
| `DB`, `H` | `data/school.js` → `db` (`db.hist` = historial) | Datos de la institución activa |
| `STORE`, `swap()` | `STORE`, `switchInstitution()` | Datos de las demás instituciones (aislamiento) |
| `C` | `data/courses.js` → `COURSES` | Cursos de reportes |
| `USER`, `NT`, `S` | `data/users.js` → `USER`, `NOTIFICATIONS`, `sentMessages` | Usuarios demo, bandejas, avisos enviados |
| `SES`, `CUR`, `DR`, ... | `core/state.js` → `state` | Estado de interfaz |

Formas de los registros (`db`): `prof {n,c,h}` · `est {n,p,c,s}` · `cur {k,n,pr,i}` · `grp {n,c,pr,i,h}` · `hist {id,f,c,g?,pr,p,a}`.

## Puntos donde conectar el backend
| Acción | Función (archivo) |
|--------|-------------------|
| Login / rol / institución | `state.role`, `state.inst`, `applyTheme()`, `render()` (`core/`) |
| CRUD profesores, estudiantes, cursos, grupos | `editEntity` / `saveEntity` / `deleteEntityOk` (`views/shared/crud.js`) |
| Historial (ver/editar/eliminar) | `histSave`, `histDeleteOk` (`views/shared/history.js`) |
| Exportar PDF/Excel/CSV | `exportModal` (`views/shared/export.js`) — hoy solo muestra un aviso |
| Crear y guardar asistencia | `startSession`, `saveSession` (`views/prof/attendance.js`) |
| Enviar notificación / correo | `sendMessage` (`views/shared/compose.js`) |
| Identidad de la institución | `identitySave`, `identityLogo` (`views/iadm/identity.js`) |
| Instituciones | `instCreate`, `instSave`, `instToggle` (`views/admin/institutions.js`) |
| Administradores institucionales | `adminSave`, `adminRemove` (`views/admin/admins.js`) |
| Perfil | `profileSave` (`views/shared/profile.js`) |

Para integrar: haz el `fetch`/POST dentro del handler y, al responder, actualiza el estado y llama a `render()`.

## Handlers inline
El HTML generado usa `onclick="..."`; por eso `main.js` publica en `window` las funciones exportadas como `xxxHandlers`
(más `go`, `toggleGroup`, `toast`, `closeModal`, `exportModal`). Si agregas un handler nuevo, expórtalo en el `index.js`
de su carpeta y se publica solo.

## Build del standalone
    npm install
    npm run build      # regenera atrium-standalone.html

## Notas
- El logo se lee como data URL (máx. 300 KB); con backend conviene subirlo y guardar la URL.
- Gráficas (barras, dona, mapa de calor, anillo) son SVG/CSS propios.
- Estadísticas, mapa de calor y reportes usan datos fijos de ejemplo.
- `theme()` (ahora `applyTheme()`) no aplica los colores `c1`/`c2` de cada institución: el sidebar usa los de `frontend`.

## Refactor respecto a la versión de un solo `app.js`
- Mismo comportamiento y mismo CSS (verificado: capturas idénticas en 3 tamaños × 4 roles y 187 pasos de interacción equivalentes).
- Se eliminó código muerto: `att`, `cyc`, `sent`, `snd`, `rep`, versiones 1 y 2 de `perfil()`, `V.admin.insts` v1, `V.prof.notif` original, helper de selector de color sin usar.
- Cambios menores: etiqueta "Nombrez" → "Nombre" en *Nueva institución*; el modal de mensaje enviado muestra al remitente real (antes siempre "Dr. Carlos Rivas"); los botones de canal reflejan el estado guardado; `sendMessage` captura los valores antes del retardo de 900 ms.
