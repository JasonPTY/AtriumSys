# ATRIUM · Proyecto Spring Boot (MVC) + frontend

Esqueleto listo para ejecutar: Spring Boot 3 (Java 17) + frontend estático ya integrado en `src/main/resources/static/`.
El backend está **solo estructurado** (controladores, servicios, repositorios y modelos vacíos); la lógica la implementas tú.

## Ejecutar
```bash
mvn spring-boot:run
# abre http://localhost:8080   (Spring sirve static/index.html en la raíz)
```
Por defecto usa H2 en memoria (perfil `dev`). Para PostgreSQL u otra BD: perfil `prod` y variables `DB_URL`, `DB_USER`, `DB_PASSWORD`.

## Estructura
```
atrium-springboot/
├── docs
│   └── ESPECIFICACIONES.md
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── atrium
│   │   │           ├── config
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   └── WebConfig.java
│   │   │           ├── controller
│   │   │           │       … (ver carpeta)
│   │   │           ├── dto
│   │   │           │   ├── request
│   │   │           │   └── response
│   │   │           ├── exception
│   │   │           │   ├── GlobalExceptionHandler.java
│   │   │           │   └── ResourceNotFoundException.java
│   │   │           ├── mapper
│   │   │           ├── model
│   │   │           │       … (ver carpeta)
│   │   │           ├── repository
│   │   │           │       … (ver carpeta)
│   │   │           ├── security
│   │   │           ├── service
│   │   │           │       … (ver carpeta)
│   │   │           ├── tenant
│   │   │           │   └── TenantContext.java
│   │   │           ├── util
│   │   │           └── AtriumApplication.java
│   │   └── resources
│   │       ├── db
│   │       │   └── migration
│   │       ├── static
│   │       │   ├── css
│   │       │   │   └── styles.css
│   │       │   ├── js
│   │       │   │   ├── api
│   │       │   │   │   └── api.js
│   │       │   │   ├── components
│   │       │   │   │   └── modal.js
│   │       │   │   ├── core
│   │       │   │   │   ├── app.js
│   │       │   │   │   ├── helpers.js
│   │       │   │   │   ├── icons.js
│   │       │   │   │   └── navigation.js
│   │       │   │   ├── data
│   │       │   │   │   └── mock-data.js
│   │       │   │   ├── features
│   │       │   │   │   ├── admin-crud.js
│   │       │   │   │   ├── attendance.js
│   │       │   │   │   ├── history.js
│   │       │   │   │   ├── institution-identity.js
│   │       │   │   │   ├── institutions.js
│   │       │   │   │   ├── notifications.js
│   │       │   │   │   ├── profile.js
│   │       │   │   │   └── reports.js
│   │       │   │   ├── roles
│   │       │   │   │   ├── institution-admin.js
│   │       │   │   │   └── platform-admin.js
│   │       │   │   └── views
│   │       │   │       └── base-views.js
│   │       │   └── index.html
│   │       ├── templates
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── application.properties
│   └── test
│       └── java
│           └── com
│               └── atrium
│                   └── AtriumApplicationTests.java
├── .gitignore
└── pom.xml
```
Carpetas `controller/`, `service/`, `repository/` y `model/` contienen un archivo por recurso (ver abajo).

## Capas (MVC por capas)
| Capa | Paquete | Responsabilidad |
|---|---|---|
| Controller | `controller` | Endpoints REST `/api/v1/...` (un controlador por recurso) |
| Service | `service` | Reglas de negocio y validación de permisos por rol |
| Repository | `repository` | Acceso a datos (Spring Data JPA) |
| Model | `model`, `model.enums` | Entidades y enums (Role, UserStatus, AcademicStatus, AttendanceStatus, NotificationChannel) |
| DTO / Mapper | `dto.request`, `dto.response`, `mapper` | Contratos de entrada/salida (no expongas entidades) |
| Config / Security | `config`, `security` | Seguridad (login, JWT/sesión, RBAC) y configuración web |
| Tenant | `tenant` | `TenantContext`: id de la institución del usuario autenticado. Filtra **toda** consulta por él |
| Exception | `exception` | Manejo uniforme de errores |

## Controlador ↔ endpoint ↔ pantalla del frontend
| Controlador | Base | Frontend (`static/js/...`) |
|---|---|---|
| AuthController | `/api/v1/auth` | login (hoy: selectores demo en `core/app.js`) |
| InstitutionController | `/api/v1/institutions` | `roles/platform-admin.js`, `features/institutions.js` |
| InstitutionIdentityController | `/api/v1/institution` | `features/institution-identity.js` |
| UserController / TeacherController / StudentController | `/users`, `/teachers`, `/students` | `features/admin-crud.js` |
| CourseController / GroupController | `/courses`, `/groups` | `features/admin-crud.js` |
| SessionController | `/sessions` | `features/attendance.js`, `features/history.js` |
| MonitoringController / ReportController / StatsController | `/monitoring`, `/reports`, `/stats` | `roles/institution-admin.js`, `features/reports.js`, `roles/platform-admin.js` |
| NotificationController | `/notifications` | `features/notifications.js` |
| PlatformSettingsController | `/platform` | `roles/platform-admin.js` (Configuración) |

Contrato completo de endpoints, modelo de datos, reglas y permisos: `docs/ESPECIFICACIONES.md`.

## Frontend (static/)
- `index.html` carga `css/styles.css` y los scripts de `js/` **en orden** (el orden importa: comparten el ámbito global).
- `js/api/api.js` trae `apiFetch()` (cliente HTTP base) listo para usar.
- `js/data/mock-data.js` y los objetos `INST`, `DB`, `H`, `S`, `NT`, `USER` contienen datos de ejemplo: **reemplázalos por llamadas a la API**.
- Cada acción (`svS`, `sv2`, `isave`, `nsave`, `snd2`, `pSave`…) cambia el estado en memoria y llama a `render()`: haz el POST/PATCH ahí y, al responder, actualiza el estado y llama a `render()`.
- Rol e institución del usuario: hoy salen de los selectores del header (demo). En producción deben venir de la sesión (`role`, `CUR`).
- Exportación PDF/Excel/CSV (`hx()`), estadísticas, mapa de calor y calendario son datos/avisos de ejemplo.

## Alternativa con Thymeleaf
Si prefieres vistas del servidor, descomenta el starter de Thymeleaf en `pom.xml`, mueve `index.html` a `templates/` y sirve con un `@Controller`. El frontend actual funciona como SPA ligera y no lo requiere.

## Siguientes pasos sugeridos
1. Entidades JPA y repositorios (todas con `institution_id`, excepto Institution y el Admin General).
2. Seguridad: login, roles `SUPER_ADMIN`, `INST_ADMIN`, `TEACHER`, `STUDENT` y carga del `TenantContext` por petición.
3. Endpoints de sesiones/asistencia, luego CRUD, notificaciones, estadísticas e instituciones.
4. Sustituir el mock del frontend por `apiFetch()`.
