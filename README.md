# ATRIUM

**Plataforma SaaS multi-institución de monitoreo y seguimiento de asistencia académica.**

ATRIUM permite a universidades, colegios e institutos registrar la asistencia de sus estudiantes, detectar a tiempo a quienes están en riesgo, comunicarse con ellos y obtener reportes, desde un panel claro y adaptable a PC, tablet y móvil. Cada institución opera aislada, con su propia identidad (nombre, logo, lema y contacto). Una administración general supervisa la plataforma sin intervenir en la operación académica diaria.

> Antes llamado **LOODLE**. Mantiene su enfoque institucional, ahora con multi-institución, roles diferenciados, horarios, seguimiento de riesgo, login completo y estadísticas globales.

---

## Contenido

1. [Características](#características)
2. [Roles y permisos](#roles-y-permisos)
3. [Estado del proyecto](#estado-del-proyecto)
4. [Tecnologías](#tecnologías)
5. [Estructura del repositorio](#estructura-del-repositorio)
6. [Puesta en marcha](#puesta-en-marcha)
7. [Login y cuentas de demostración](#login-y-cuentas-de-demostración)
8. [Base de datos](#base-de-datos)
9. [API REST (contrato propuesto)](#api-rest-contrato-propuesto)
10. [Arquitectura del frontend](#arquitectura-del-frontend)
11. [Arquitectura del backend (propuesta)](#arquitectura-del-backend-propuesta)
12. [Seguridad](#seguridad)
13. [Flujo de desarrollo](#flujo-de-desarrollo)
14. [Hoja de ruta](#hoja-de-ruta)
15. [Notas técnicas conocidas](#notas-técnicas-conocidas)

---

## Características

- **Asistencia en segundos:** el profesor crea la clase (curso y grupo; fecha y hora automáticas), marca a cada estudiante como *Asistió* / *No asistió* y guarda. Contadores en vivo y opción de marcar a todos presentes.
- **Historial:** consultar, ver detalle, editar, eliminar (con confirmación) y exportar (PDF, Excel, CSV) las clases dictadas.
- **Seguimiento de riesgo:** monitoreo de estudiantes y cursos bajo la meta, con semáforo de asistencia (verde ≥ 90 %, ámbar 80–89 %, rojo < 80 %).
- **Notificaciones:** redactor tipo correo con destinatario, canal y vista previa; bandeja para el estudiante.
- **Multi-institución:** datos aislados por institución, activación y desactivación, administrador institucional por institución.
- **Identidad institucional:** nombre, nombre corto, lema, sitio web, contacto y logo, aplicados a la interfaz de sus usuarios. Los colores de la plataforma son fijos.
- **Reportes y estadísticas:** por institución y globales (gráficos de barras, circular y mapa de calor).
- **Login completo:** correo o usuario, bloqueo temporal, recuperación y cambio de contraseña, sesión segura y cierre de sesión.
- **Diseño:** sidebar con grupos plegables, modo oscuro automático, responsivo (móvil con menú hamburguesa, tablet con sidebar de íconos, escritorio completo), tipografía Inter y paleta azul `#1E3A8A`, gris `#F3F4F6`, verde `#10B981` y rojo `#EF4444`.

## Roles y permisos

| Rol | Responsabilidad | Alcance de datos |
|---|---|---|
| **Administrador General** (`admin`) | Gestionar la plataforma: instituciones (crear, editar, activar/desactivar), administradores institucionales, estadísticas globales y configuración. No opera la parte académica. | Todas las instituciones (gestión y datos agregados) |
| **Administrador Institucional** (`iadm`) | Operación completa de su institución: usuarios, profesores, estudiantes, cursos, grupos, asistencias, monitoreo, reportes, notificaciones e identidad. | Solo su institución |
| **Profesor** (`prof`) | Registrar asistencia, historial, notificaciones y reportes de sus cursos. | Sus cursos y grupos |
| **Estudiante** (`est`) | Ver su progreso, clases, asistencias y notificaciones. | Sus propios datos |

El menú de cada rol se define en `frontend/js/core/config.js` y es la única fuente de verdad para los permisos de navegación del frontend. **La seguridad real la aplica el backend.**

## Estado del proyecto

**Hecho**
- Frontend completo para los cuatro roles (datos de ejemplo), login integrado y responsivo.
- Base de datos `atrium_system` diseñada (25 tablas, 2 vistas), validada en MySQL 8.
- Documentación: especificaciones, visión y contrato de autenticación.

**Pendiente**
- Backend Spring Boot (autenticación, API, persistencia y envío de correos).
- Conectar el frontend a la API (`AUTH_MODE = "api"` y reemplazo de los datos de ejemplo).
- Exportación real a PDF, Excel y CSV; estadísticas y reportes con datos reales.
- Pantalla de restablecimiento desde el enlace del correo con token real, auditoría y pruebas.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript con **módulos ES** (sin framework). Empaquetado a un solo archivo con esbuild. |
| Backend (propuesto) | Spring Boot 3, Java 17, Maven, arquitectura MVC por capas |
| Base de datos | MySQL 8.0.16+ (InnoDB, utf8mb4) |
| Herramientas | IntelliJ IDEA, phpMyAdmin / DBeaver, Node.js (solo para el build del frontend) |

## Estructura del repositorio

```
Atrium/
├── README.md
├── package.json                  # scripts del frontend (esbuild)
├── scripts/
│   └── build-standalone.mjs      # genera atrium-standalone.html
├── database/
│   └── atrium_system.sql         # estructura completa de la base de datos
└── frontend/
    ├── index.html
    ├── atrium-standalone.html    # toda la app en un solo archivo
    ├── css/                      # main.css + capas 01…09 (el orden importa)
    └── js/
        ├── main.js               # punto de entrada
        ├── core/                 # estado, render, config de menús, tema, reloj
        ├── auth/                 # login, sesión, recuperación y cambio de contraseña
        ├── data/                 # datos de ejemplo (reemplazar por la API)
        ├── ui/                   # iconos, componentes, gráficos, modal, toast
        └── views/
            ├── admin/            # Administrador General
            ├── iadm/             # Administrador Institucional
            ├── prof/             # Profesor
            ├── est/              # Estudiante
            └── shared/           # historial, notificaciones, perfil, reportes, CRUD
```

El backend se agregará como carpeta `backend/` (ver [propuesta](#arquitectura-del-backend-propuesta)).

## Puesta en marcha

### Requisitos
- Node.js 18+ (solo para regenerar el archivo standalone)
- MySQL 8.0.16+ (o el MySQL de XAMPP) y un cliente (phpMyAdmin, DBeaver o consola)
- Para el backend: JDK 17 y Maven (o el Maven de IntelliJ)

### 1. Frontend
La forma más directa: abre **`frontend/atrium-standalone.html`** en el navegador (funciona sin servidor).

Para regenerarlo después de cambiar el código:

```bash
npm install
npm run build      # ver "Notas técnicas conocidas" si el script no encuentra css/ y js/
```

### 2. Base de datos
1. Abre phpMyAdmin (pestaña **SQL** o **Importar**) o la consola y ejecuta `database/atrium_system.sql`:
   ```bash
   mysql -u root -p < database/atrium_system.sql
   ```
2. Carga los datos mínimos (no incluidos en el script): los 4 tipos de usuario (*Administrador General, Administrador Institucional, Docente, Estudiante*), la fila `id = 1` de `configuracion_plataforma` y el primer Administrador General con su contraseña cifrada (BCrypt o Argon2).
3. Crea un usuario para la aplicación (no uses `root`):
   ```sql
   CREATE USER 'atrium_app'@'localhost' IDENTIFIED BY 'TuClaveSegura123!';
   GRANT SELECT, INSERT, UPDATE, DELETE ON atrium_system.* TO 'atrium_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 3. Backend (cuando se cree)
```bash
cd backend
mvn spring-boot:run          # perfil dev; usa DB_USER y DB_PASSWORD
```
Variables de entorno sugeridas: `DB_URL`, `DB_USER`, `DB_PASSWORD`. Las pruebas pueden usar Testcontainers con MySQL.

## Login y cuentas de demostración

El login vive en `frontend/js/auth/`. Con `AUTH_MODE = "demo"` (en `config.js`) usa cuentas locales; con `"api"` usa el backend.

Contraseña de demostración: **`Atrium2026!`**

| Usuario | Correo | Rol |
|---|---|---|
| `lmendez` | `laura.mendez@atrium.edu` | Administrador general |
| `msolis` | `m.solis@atrium.edu` | Admin institucional (UNI) |
| `plara` | `p.lara@santalucia.edu` | Admin institucional (CSL). Contraseña temporal `Temporal2026!`: obliga a cambiarla |
| `crivas` | `c.rivas@atrium.edu` | Profesor |
| `atorres` | `ana.torres@atrium.edu` | Estudiante |

**Reglas del login**
- Se ingresa con correo o usuario (únicos en toda la plataforma).
- Mensaje único ante error: no revela si la cuenta existe.
- 5 intentos fallidos bloquean el acceso 15 minutos (con cuenta regresiva).
- Recuperación: respuesta siempre igual, enlace de 15 minutos de un solo uso, reenvío cada 60 segundos.
- Contraseña: mínimo 10 caracteres, mayúscula y minúscula, número, símbolo y sin contener el usuario o el correo.
- La sesión se cierra tras 30 minutos de inactividad (aviso 60 s antes); "Recordarme" dura 7 días; el cierre se sincroniza entre pestañas.
- Una institución **inactiva** no permite el ingreso de sus usuarios.

Las cuentas de demostración se eliminan al pasar a producción (`DEMO_USERS` en `config.js`).

## Base de datos

`database/atrium_system.sql` crea la base **`atrium_system`**: **25 tablas y 2 vistas**, sin datos.

| Dominio | Tablas |
|---|---|
| Plataforma e instituciones | `tipos_usuario`, `instituciones`, `usuarios`, `configuracion_plataforma`, `configuracion_institucion` |
| Seguridad y perfil | `preferencias_usuario`, `intentos_login`, `sesiones_usuarios`, `tokens_recuerdo`, `tokens_recuperacion` |
| Estructura académica | `periodos_academicos`, `carreras`, `grupos`, `cursos`, `estudiantes`, `profesores`, `asignaciones`, `inscripciones`, `horarios` |
| Asistencia y seguimiento | `asistencia`, `asistencia_detalle`, `seguimientos` |
| Comunicación | `notificaciones`, `notificaciones_usuarios` |
| Auditoría | `auditoria` |
| Vistas | `v_asistencia_sesion`, `v_asistencia_estudiante` |

**Ideas clave**
- **Multi-institución:** las tablas raíz llevan `id_institucion`; el resto se filtra por JOIN.
- **Carga académica:** una `asignacion` une curso, grupo, periodo y docente; los estudiantes se inscriben a asignaciones.
- **Asistencia:** cada clase dictada es una fila de `asistencia`, con un detalle por estudiante (*Presente*, *Ausente*, *Tardanza*).
- **Porcentaje de asistencia:** (Presente + Tardanza) / clases registradas. "En riesgo" no se guarda: se calcula con las vistas y se registra en `seguimientos`.
- **Seguridad:** contraseñas y tokens se guardan siempre como **hash** (BCrypt/Argon2 y SHA-256).
- 53 índices, todas las llaves foráneas indexadas y restricciones `CHECK` (MySQL 8.0.16+).

**Reglas que valida el backend**
- El Administrador General tiene `usuarios.id_institucion = NULL`; los demás roles siempre pertenecen a una institución.
- Curso, grupo y periodo de una asignación deben ser de la misma institución.
- Solo se marca asistencia a estudiantes inscritos en esa asignación.

## API REST (contrato propuesto)

Prefijo `/api/v1`. El rol y la institución salen **siempre** de la sesión, nunca del cliente.

| Recurso | Endpoints |
|---|---|
| Autenticación | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/change-password` |
| Instituciones (Admin General) | `GET/POST /institutions`, `GET/PATCH /institutions/{id}`, `POST /institutions/{id}/activate`, `POST /institutions/{id}/deactivate` |
| Administradores institucionales | `GET/POST /institutions/{id}/admins`, `PATCH/DELETE /institutions/{id}/admins/{userId}` |
| Identidad | `GET/PATCH /institution`, `POST /institution/logo` |
| Usuarios, profesores, estudiantes | `GET/POST /users`, `/teachers`, `/students`; `PATCH/DELETE /…/{id}` |
| Cursos y grupos | `GET/POST /courses`, `/groups`; `PATCH/DELETE /…/{id}`; `POST /groups/{id}/students` |
| Asistencia | `POST /sessions`, `PUT /sessions/{id}/attendance`, `GET /sessions`, `GET/PATCH/DELETE /sessions/{id}`, `GET /sessions/export?format=pdf\|xlsx\|csv` |
| Monitoreo y reportes | `GET /monitoring/at-risk`, `GET /reports/attendance`, `GET /stats/institution`, `GET /stats/global` |
| Notificaciones | `POST /notifications`, `GET /notifications/sent`, `GET /notifications/inbox`, `PATCH /notifications/{id}/read` |
| Plataforma | `GET/PATCH /platform/settings` |

**Login (`POST /auth/login`)**: entrada `{usuario, password, recordarme}`; respuesta `200 {usuario, correo, nombre, rol, institucionId, debeCambiarPassword}`. Errores: `401` credenciales, `423/429` bloqueo, `403` institución inactiva. `rol` ∈ `SUPER_ADMIN`, `INST_ADMIN`, `TEACHER`, `STUDENT`. La sesión viaja en una cookie `HttpOnly`.

## Arquitectura del frontend

Módulos ES sin framework, con estado compartido y vistas registradas por rol.

- `core/state.js`: estado mutable (`role`, `sec`, `inst`, `session`…).
- `core/config.js`: menús por rol y agrupación del sidebar.
- `core/registry.js` + `core/render.js`: registro de vistas y repintado (`render()`).
- `core/theme.js`: marca de la institución (logo, nombre, título).
- `data/`: datos de ejemplo. Aquí se conecta la API.
- `views/<rol>/index.js`: exporta las vistas y los *handlers* del rol; `main.js` los publica en `window` para los `onclick` del HTML generado.

**Agregar una pantalla**
1. Crea la vista en `views/<rol>/` (función que devuelve HTML).
2. Expórtala en `views/<rol>/index.js` y agrega su entrada en `MENU` (y en `GROUPS` si va en un grupo) de `core/config.js`.
3. Si tiene acciones, exporta sus *handlers* para que `main.js` los publique.

**Conectar la API:** cada acción (`profileSave`, `attendanceSave`, etc.) cambia el estado y llama a `render()`. Haz la petición ahí y, al responder, actualiza el estado y vuelve a `render()`.

## Arquitectura del backend (propuesta)

Spring Boot 3 (Java 17) con paquetes por capa bajo `com.atrium`:

```
backend/src/main/java/com/atrium/
├── controller/    # endpoints REST /api/v1 (un controlador por recurso)
├── service/       # reglas de negocio, transacciones, permisos finos, auditoría
├── repository/    # Spring Data JPA, siempre filtrado por institución
├── model/         # entidades y enums
├── dto/           # request / response (no exponer entidades)
├── mapper/        # MapStruct
├── security/      # login, sesión, RBAC
├── tenant/        # TenantContext: institución del usuario autenticado
├── config/
└── exception/     # manejo uniforme de errores
```

**Aislamiento entre instituciones:** un filtro guarda el `id_institucion` de la sesión en `TenantContext`; los servicios lo leen de ahí y los repositorios consultan siempre por id e institución. Mapea los enums de la base (`'Activo'`, `'Pendiente'`…) con `AttributeConverter` y usa `@Column(name = "id_tipoUsuario")` en esa columna.

## Seguridad

- Control de acceso por rol y filtro obligatorio por institución en cada consulta (el frontend solo mejora la experiencia).
- Contraseñas con BCrypt o Argon2; tokens de recuperación y de sesión guardados como hash SHA-256.
- Sesión por cookie `HttpOnly` + `SameSite`; protección CSRF; cabecera `X-Requested-With`.
- Bloqueo por intentos en servidor (`intentos_login`), no en el navegador.
- Validar en servidor tipo y tamaño del logo; guardar solo la URL.
- Auditoría de inicios de sesión, bloqueos, cambios de contraseña y cambios en historial, usuarios e instituciones.
- Datos de estudiantes (posibles menores): cumplir la normativa local de protección de datos.

## Flujo de desarrollo

1. **Por funcionalidad, de abajo hacia arriba:** tablas → entidad → repositorio → DTO y mapper → servicio (reglas, institución, auditoría) → controlador → pruebas → conectar el frontend.
2. **Git:** rama `main` protegida; una rama por funcionalidad (`feature/asistencia-sesiones`); commits `feat:`, `fix:`, `test:`; pull request con revisión.
3. **Pruebas:** servicios con Mockito, repositorios con Testcontainers (MySQL real), controladores con `@WebMvcTest` y una prueba de **aislamiento entre instituciones** por cada recurso.
4. **Migraciones:** pasar a Flyway desde `V1__init.sql` (el script sin `CREATE DATABASE` ni `USE`); no editar migraciones ya aplicadas.
5. **Configuración:** perfiles `dev` y `prod`; secretos solo en variables de entorno.

## Hoja de ruta

| Fase | Contenido |
|---|---|
| 0 · Prototipo (hecha) | Interfaz de los cuatro roles, login y base de datos |
| 1 · Fundamentos | Backend base, autenticación, roles, multi-institución y auditoría |
| 2 · Núcleo académico | Usuarios, profesores, estudiantes, cursos, grupos, periodos, asignaciones, inscripciones y horarios |
| 3 · Asistencia | Crear y tomar lista, historial, edición, eliminación y exportación |
| 4 · Seguimiento y comunicación | Monitoreo, riesgo, notificaciones por correo y panel |
| 5 · Analítica y plataforma | Reportes, estadísticas globales, configuración y gestión de instituciones |
| 6 · Evolución | Mejoras según el uso real |

Fuera de alcance por ahora: calificaciones, pagos, contenidos de cursos (LMS) y app móvil nativa. Ideas a evaluar: registro por QR o ubicación, alertas automáticas, analítica predictiva de deserción.

## Notas técnicas conocidas

1. **`scripts/build-standalone.mjs`** calcula `root` como la carpeta padre de `scripts/`, pero `css/` y `js/` están en `frontend/`. Para que `npm run build` funcione, cambia la línea de `root` a:
   ```js
   const root = join(dirname(fileURLToPath(import.meta.url)), "..", "frontend");
   ```
2. **`frontend/js/main.js`** importa `./views/admin`, `./views/iadm`, `./views/prof` y `./views/est` sin `/index.js`. Funciona al empaquetar con esbuild, pero un servidor estático (por ejemplo `npx serve`) abriendo los módulos directamente no resolverá esas rutas. Solución: agregar `/index.js` a esos cuatro imports.
3. **`.gitignore`** está vacío. Sugerido: `node_modules/`, `backend/target/`, `.idea/`, `*.iml`, `.env`, `*.log`.
4. Los datos del frontend son de ejemplo y se guardan solo en memoria o en el navegador hasta conectar la API.

## Licencia y contacto

_Por definir._ Agrega aquí la licencia del proyecto y los datos de contacto del equipo.
