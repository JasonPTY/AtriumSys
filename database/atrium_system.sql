-- =====================================================================
--  ATRIUM · Estructura completa de la base de datos  (atrium_system)
--  Motor: MySQL 8.0.16+ (InnoDB, utf8mb4)  ·  Solo estructura, sin datos
--  Contenido: 25 tablas + 2 vistas
--
--  Modelo multi-institución: cada institución es un "tenant". Las tablas raíz
--  (usuarios, periodos, carreras, grupos, cursos, seguimientos, notificaciones,
--  auditoría) llevan id_institucion; el resto se filtra por JOIN.
--  Regla de aplicación: el Administrador General tiene
--  usuarios.id_institucion = NULL; los demás roles siempre pertenecen a una.
--
--  Autenticación (login): acceso por correo o usuario, bloqueo temporal por
--  intentos, recuperación y cambio de contraseña, sesiones revocables.
--  Guarda siempre HASH de contraseñas (BCrypt/Argon2) y de tokens (SHA-256).
--
--  Catálogo requerido (cargar aparte):
--    tipos_usuario: Administrador General, Administrador Institucional,
--                   Docente, Estudiante
--    configuracion_plataforma: una fila con id = 1
-- =====================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `atrium_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `atrium_system`;

-- =====================================================================
-- 1. PLATAFORMA E INSTITUCIONES
-- =====================================================================

CREATE TABLE `tipos_usuario` (
                                 `id_tipoUsuario` int(11) NOT NULL AUTO_INCREMENT,
                                 `tipo` varchar(30) NOT NULL,
                                 PRIMARY KEY (`id_tipoUsuario`),
                                 UNIQUE KEY `uq_tipos_usuario_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `instituciones` (
                                 `id_institucion` int(11) NOT NULL AUTO_INCREMENT,
                                 `nombre` varchar(150) NOT NULL,
                                 `nombre_corto` varchar(20) NOT NULL,
                                 `lema` varchar(150) DEFAULT NULL,
                                 `sitio_web` varchar(150) DEFAULT NULL,
                                 `correo_contacto` varchar(100) DEFAULT NULL,
                                 `logo_url` varchar(255) DEFAULT NULL,
                                 `estado` enum('Activa','Inactiva') NOT NULL DEFAULT 'Activa',
                                 `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                                 `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                 PRIMARY KEY (`id_institucion`),
                                 UNIQUE KEY `uq_instituciones_nombre` (`nombre`),
                                 UNIQUE KEY `uq_instituciones_corto` (`nombre_corto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuarios (la cédula identifica a la persona en toda la plataforma).
-- Se inicia sesión con `correo` o `usuario`; ambos son únicos en toda la plataforma.
CREATE TABLE `usuarios` (
                            `cedula` varchar(20) NOT NULL,
                            `usuario` varchar(30) DEFAULT NULL,
                            `id_institucion` int(11) DEFAULT NULL,
                            `nombre` varchar(50) NOT NULL,
                            `apellido` varchar(50) NOT NULL,
                            `correo` varchar(100) NOT NULL,
                            `telefono` varchar(25) DEFAULT NULL,
                            `id_tipoUsuario` int(11) NOT NULL,
                            `pass` varchar(255) NOT NULL,
                            `debe_cambiar_password` tinyint(1) NOT NULL DEFAULT 0,
                            `password_cambiada_en` datetime DEFAULT NULL,
                            `estado` enum('Activo','Pendiente','Suspendido') NOT NULL DEFAULT 'Activo',
                            `idioma` enum('es','en') NOT NULL DEFAULT 'es',
                            `avatar_url` varchar(255) DEFAULT NULL,
                            `ultimo_acceso` datetime DEFAULT NULL,
                            `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                            `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                            PRIMARY KEY (`cedula`),
                            UNIQUE KEY `uq_usuarios_correo` (`correo`),
                            UNIQUE KEY `uq_usuarios_usuario` (`usuario`),
                            KEY `idx_usuarios_institucion_tipo` (`id_institucion`,`id_tipoUsuario`),
                            KEY `fk_usuarios_id_tipoUsuario` (`id_tipoUsuario`),
                            CONSTRAINT `fk_usuarios_id_tipoUsuario` FOREIGN KEY (`id_tipoUsuario`) REFERENCES `tipos_usuario` (`id_tipoUsuario`) ON UPDATE CASCADE,
                            CONSTRAINT `fk_usuarios_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Configuración global de la plataforma (una sola fila, id = 1)
CREATE TABLE `configuracion_plataforma` (
                                            `id` tinyint(4) NOT NULL DEFAULT 1,
                                            `periodo_vigente` varchar(20) DEFAULT NULL,
                                            `asistencia_minima` tinyint(3) unsigned NOT NULL DEFAULT 75,
                                            `idioma_defecto` enum('es','en') NOT NULL DEFAULT 'es',
                                            `zona_horaria` varchar(50) NOT NULL DEFAULT 'America/Panama',
                                            `permitir_registro_instituciones` tinyint(1) NOT NULL DEFAULT 1,
                                            `notificaciones_correo` tinyint(1) NOT NULL DEFAULT 1,
                                            `modo_mantenimiento` tinyint(1) NOT NULL DEFAULT 0,
                                            `actualizado_por` varchar(20) DEFAULT NULL,
                                            `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                            PRIMARY KEY (`id`),
                                            CONSTRAINT `ck_config_plataforma_unica` CHECK (`id` = 1),
                                            CONSTRAINT `ck_config_plataforma_pct` CHECK (`asistencia_minima` BETWEEN 0 AND 100),
                                            CONSTRAINT `fk_config_plataforma_usuario` FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Parámetros por institución (NULL = hereda de la plataforma)
CREATE TABLE `configuracion_institucion` (
                                             `id_institucion` int(11) NOT NULL,
                                             `asistencia_minima` tinyint(3) unsigned DEFAULT NULL,
                                             `meta_asistencia` tinyint(3) unsigned NOT NULL DEFAULT 90,
                                             `minutos_tolerancia_tardanza` smallint(5) unsigned NOT NULL DEFAULT 10,
                                             `idioma` enum('es','en') DEFAULT NULL,
                                             `zona_horaria` varchar(50) DEFAULT NULL,
                                             `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                             PRIMARY KEY (`id_institucion`),
                                             CONSTRAINT `ck_config_inst_pct` CHECK (`meta_asistencia` BETWEEN 0 AND 100 AND (`asistencia_minima` IS NULL OR `asistencia_minima` BETWEEN 0 AND 100)),
                                             CONSTRAINT `fk_config_inst_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 2. SEGURIDAD Y PERFIL
-- =====================================================================

CREATE TABLE `preferencias_usuario` (
                                        `cedula` varchar(20) NOT NULL,
                                        `alertas_correo` tinyint(1) NOT NULL DEFAULT 1,
                                        `notificaciones_panel` tinyint(1) NOT NULL DEFAULT 1,
                                        `resumen_semanal` tinyint(1) NOT NULL DEFAULT 0,
                                        PRIMARY KEY (`cedula`),
                                        CONSTRAINT `fk_preferencias_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Bloqueo temporal por intentos fallidos. `identificador` es lo que se escribió (correo o usuario),
-- exista o no la cuenta, para no revelar qué cuentas existen.
CREATE TABLE `intentos_login` (
                                  `id` int(11) NOT NULL AUTO_INCREMENT,
                                  `identificador` varchar(100) NOT NULL,
                                  `cedula` varchar(20) DEFAULT NULL,
                                  `intentos` int(11) NOT NULL DEFAULT 0,
                                  `bloqueado_hasta` datetime DEFAULT NULL,
                                  `ip_address` varchar(45) DEFAULT NULL,
                                  `ultimo_intento` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                  PRIMARY KEY (`id`),
                                  UNIQUE KEY `uq_intentos_login_identificador` (`identificador`),
                                  KEY `idx_intentos_login_cedula` (`cedula`),
                                  CONSTRAINT `fk_intentos_login_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sesión del servidor: se revoca al cerrar sesión, por inactividad o al cambiar la contraseña.
CREATE TABLE `sesiones_usuarios` (
                                     `id` int(11) NOT NULL AUTO_INCREMENT,
                                     `cedula` varchar(20) NOT NULL,
                                     `token_hash` char(64) DEFAULT NULL,
                                     `recordarme` tinyint(1) NOT NULL DEFAULT 0,
                                     `inicio_sesion` datetime NOT NULL,
                                     `fin_sesion` datetime DEFAULT NULL,
                                     `ultima_actividad` datetime DEFAULT NULL,
                                     `expira_en` datetime DEFAULT NULL,
                                     `revocada` tinyint(1) NOT NULL DEFAULT 0,
                                     `motivo_cierre` enum('Manual','Inactividad','Contraseña cambiada','Revocada','Expirada') DEFAULT NULL,
                                     `ip_address` varchar(45) DEFAULT NULL,
                                     `user_agent` text DEFAULT NULL,
                                     PRIMARY KEY (`id`),
                                     UNIQUE KEY `uq_sesiones_token_hash` (`token_hash`),
                                     KEY `idx_sesiones_cedula_inicio` (`cedula`,`inicio_sesion`),
                                     KEY `idx_sesiones_expira` (`expira_en`),
                                     CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Token de "Recordarme" (se guarda el hash)
CREATE TABLE `tokens_recuerdo` (
                                   `id` int(11) NOT NULL AUTO_INCREMENT,
                                   `cedula` varchar(20) NOT NULL,
                                   `token` varchar(64) NOT NULL,
                                   `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
                                   `fecha_expiracion` datetime DEFAULT NULL,
                                   PRIMARY KEY (`id`),
                                   UNIQUE KEY `uq_tokens_token` (`token`),
                                   KEY `idx_tokens_cedula` (`cedula`),
                                   CONSTRAINT `fk_tokens_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Enlaces de recuperación de contraseña: solo el hash SHA-256 del token, vigencia 15 min, un solo uso.
CREATE TABLE `tokens_recuperacion` (
                                       `id` int(11) NOT NULL AUTO_INCREMENT,
                                       `cedula` varchar(20) NOT NULL,
                                       `token_hash` char(64) NOT NULL,
                                       `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                                       `expira_en` datetime NOT NULL,
                                       `usado_en` datetime DEFAULT NULL,
                                       `ip_address` varchar(45) DEFAULT NULL,
                                       `user_agent` varchar(255) DEFAULT NULL,
                                       PRIMARY KEY (`id`),
                                       UNIQUE KEY `uq_tokens_recuperacion_hash` (`token_hash`),
                                       KEY `idx_tokens_recuperacion_cedula` (`cedula`,`usado_en`),
                                       KEY `idx_tokens_recuperacion_expira` (`expira_en`),
                                       CONSTRAINT `fk_tokens_recuperacion_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 3. ESTRUCTURA ACADÉMICA
-- =====================================================================

CREATE TABLE `periodos_academicos` (
                                       `id_periodo` int(11) NOT NULL AUTO_INCREMENT,
                                       `id_institucion` int(11) NOT NULL,
                                       `nombre` varchar(30) NOT NULL,
                                       `fecha_inicio` date NOT NULL,
                                       `fecha_fin` date NOT NULL,
                                       `estado` enum('Planificado','Vigente','Cerrado') NOT NULL DEFAULT 'Planificado',
                                       PRIMARY KEY (`id_periodo`),
                                       UNIQUE KEY `uq_periodo_institucion_nombre` (`id_institucion`,`nombre`),
                                       CONSTRAINT `ck_periodo_fechas` CHECK (`fecha_fin` >= `fecha_inicio`),
                                       CONSTRAINT `fk_periodo_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `carreras` (
                            `id_carrera` int(11) NOT NULL AUTO_INCREMENT,
                            `id_institucion` int(11) NOT NULL,
                            `nombre_carrera` varchar(100) NOT NULL,
                            `estado` enum('Activa','Inactiva') NOT NULL DEFAULT 'Activa',
                            PRIMARY KEY (`id_carrera`),
                            UNIQUE KEY `uq_carrera_institucion_nombre` (`id_institucion`,`nombre_carrera`),
                            CONSTRAINT `fk_carreras_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Grupo = cohorte/sección de estudiantes (codigo_grupo único por institución, ej. '3LS001')
CREATE TABLE `grupos` (
                          `id_grupo` int(11) NOT NULL AUTO_INCREMENT,
                          `id_institucion` int(11) NOT NULL,
                          `id_carrera` int(11) DEFAULT NULL,
                          `id_periodo` int(11) DEFAULT NULL,
                          `codigo_grupo` varchar(20) NOT NULL,
                          `nombre_grupo` varchar(80) NOT NULL,
                          `capacidad` smallint(5) unsigned DEFAULT NULL,
                          `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
                          PRIMARY KEY (`id_grupo`),
                          UNIQUE KEY `uq_grupo_institucion_codigo` (`id_institucion`,`codigo_grupo`),
                          KEY `idx_grupos_carrera` (`id_carrera`),
                          KEY `idx_grupos_periodo` (`id_periodo`),
                          CONSTRAINT `fk_grupos_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE,
                          CONSTRAINT `fk_grupos_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE,
                          CONSTRAINT `fk_grupos_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Catálogo de cursos de la institución
CREATE TABLE `cursos` (
                          `id_curso` int(11) NOT NULL AUTO_INCREMENT,
                          `id_institucion` int(11) NOT NULL,
                          `id_carrera` int(11) DEFAULT NULL,
                          `codigo_curso` varchar(20) NOT NULL,
                          `nombre_curso` varchar(100) NOT NULL,
                          `creditos` tinyint(3) unsigned DEFAULT NULL,
                          `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
                          PRIMARY KEY (`id_curso`),
                          UNIQUE KEY `uq_curso_institucion_codigo` (`id_institucion`,`codigo_curso`),
                          KEY `idx_cursos_carrera` (`id_carrera`),
                          CONSTRAINT `fk_cursos_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE,
                          CONSTRAINT `fk_cursos_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Perfil de estudiante. "En riesgo" no se guarda: se calcula (v_asistencia_estudiante) y se registra en seguimientos
CREATE TABLE `estudiantes` (
                               `cedula` varchar(20) NOT NULL,
                               `id_carrera` int(11) DEFAULT NULL,
                               `id_grupo` int(11) DEFAULT NULL,
                               `estado_academico` enum('Activo','Retirado','Suspendido') NOT NULL DEFAULT 'Activo',
                               `fecha_ingreso` date DEFAULT NULL,
                               PRIMARY KEY (`cedula`),
                               KEY `idx_estudiantes_carrera` (`id_carrera`),
                               KEY `idx_estudiantes_grupo` (`id_grupo`),
                               CONSTRAINT `fk_estudiantes_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
                               CONSTRAINT `fk_estudiantes_id_carrera` FOREIGN KEY (`id_carrera`) REFERENCES `carreras` (`id_carrera`) ON DELETE SET NULL ON UPDATE CASCADE,
                               CONSTRAINT `fk_estudiantes_id_grupo` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Perfil de docente
CREATE TABLE `profesores` (
                              `cedula` varchar(20) NOT NULL,
                              `horas_semanales` tinyint(3) unsigned NOT NULL DEFAULT 0,
                              `especialidad` varchar(100) DEFAULT NULL,
                              `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
                              PRIMARY KEY (`cedula`),
                              CONSTRAINT `fk_profesores_usuario` FOREIGN KEY (`cedula`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Carga académica: curso + grupo + periodo + docente
CREATE TABLE `asignaciones` (
                                `id_asignacion` int(11) NOT NULL AUTO_INCREMENT,
                                `id_curso` int(11) NOT NULL,
                                `id_grupo` int(11) NOT NULL,
                                `id_periodo` int(11) NOT NULL,
                                `cedula_profesor` varchar(20) DEFAULT NULL,
                                `aula` varchar(30) DEFAULT NULL,
                                `estado` enum('Activa','Inactiva') NOT NULL DEFAULT 'Activa',
                                PRIMARY KEY (`id_asignacion`),
                                UNIQUE KEY `uq_asignacion_curso_grupo_periodo` (`id_curso`,`id_grupo`,`id_periodo`),
                                KEY `idx_asignaciones_profesor` (`cedula_profesor`),
                                KEY `idx_asignaciones_grupo` (`id_grupo`),
                                KEY `idx_asignaciones_periodo` (`id_periodo`),
                                CONSTRAINT `fk_asignaciones_curso` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
                                CONSTRAINT `fk_asignaciones_grupo` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE CASCADE ON UPDATE CASCADE,
                                CONSTRAINT `fk_asignaciones_periodo` FOREIGN KEY (`id_periodo`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE CASCADE ON UPDATE CASCADE,
                                CONSTRAINT `fk_asignaciones_profesor` FOREIGN KEY (`cedula_profesor`) REFERENCES `profesores` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inscripción del estudiante a una asignación (curso + grupo + periodo)
CREATE TABLE `inscripciones` (
                                 `id_inscripcion` int(11) NOT NULL AUTO_INCREMENT,
                                 `id_asignacion` int(11) NOT NULL,
                                 `cedula` varchar(20) NOT NULL,
                                 `estado` enum('Inscrito','Retirado','Aprobado','Reprobado') NOT NULL DEFAULT 'Inscrito',
                                 `fecha_inscripcion` timestamp NOT NULL DEFAULT current_timestamp(),
                                 PRIMARY KEY (`id_inscripcion`),
                                 UNIQUE KEY `uq_inscripcion_asignacion_estudiante` (`id_asignacion`,`cedula`),
                                 KEY `idx_inscripciones_cedula` (`cedula`),
                                 CONSTRAINT `fk_inscripciones_asignacion` FOREIGN KEY (`id_asignacion`) REFERENCES `asignaciones` (`id_asignacion`) ON DELETE CASCADE ON UPDATE CASCADE,
                                 CONSTRAINT `fk_inscripciones_estudiante` FOREIGN KEY (`cedula`) REFERENCES `estudiantes` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Horario semanal de cada asignación
CREATE TABLE `horarios` (
                            `id_horario` int(11) NOT NULL AUTO_INCREMENT,
                            `id_asignacion` int(11) NOT NULL,
                            `dia_semana` enum('lunes','martes','miércoles','jueves','viernes','sábado','domingo') NOT NULL,
                            `hora_inicio` time NOT NULL,
                            `hora_fin` time NOT NULL,
                            `aula` varchar(30) DEFAULT NULL,
                            PRIMARY KEY (`id_horario`),
                            UNIQUE KEY `uq_horario_asignacion_dia_hora` (`id_asignacion`,`dia_semana`,`hora_inicio`),
                            CONSTRAINT `ck_horario_horas` CHECK (`hora_fin` > `hora_inicio`),
                            CONSTRAINT `fk_horarios_asignacion` FOREIGN KEY (`id_asignacion`) REFERENCES `asignaciones` (`id_asignacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 4. ASISTENCIA Y SEGUIMIENTO
-- =====================================================================

-- Una fila = una clase concreta dictada (curso + grupo + fecha/hora)
CREATE TABLE `asistencia` (
                              `id_asistencia` int(11) NOT NULL AUTO_INCREMENT,
                              `id_asignacion` int(11) NOT NULL,
                              `id_horario` int(11) DEFAULT NULL,
                              `cedula_profesor` varchar(20) DEFAULT NULL,
                              `fecha` date NOT NULL,
                              `hora` time NOT NULL,
                              `estado` enum('Abierta','Cerrada') NOT NULL DEFAULT 'Abierta',
                              `creado_por` varchar(20) DEFAULT NULL,
                              `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                              `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                              PRIMARY KEY (`id_asistencia`),
                              UNIQUE KEY `uq_asistencia_asignacion_fecha_hora` (`id_asignacion`,`fecha`,`hora`),
                              KEY `idx_asistencia_fecha` (`fecha`),
                              KEY `idx_asistencia_profesor` (`cedula_profesor`),
                              KEY `idx_asistencia_horario` (`id_horario`),
                              KEY `idx_asistencia_creado_por` (`creado_por`),
                              CONSTRAINT `fk_asistencia_asignacion` FOREIGN KEY (`id_asignacion`) REFERENCES `asignaciones` (`id_asignacion`) ON DELETE CASCADE ON UPDATE CASCADE,
                              CONSTRAINT `fk_asistencia_horario` FOREIGN KEY (`id_horario`) REFERENCES `horarios` (`id_horario`) ON DELETE SET NULL ON UPDATE CASCADE,
                              CONSTRAINT `fk_asistencia_profesor` FOREIGN KEY (`cedula_profesor`) REFERENCES `profesores` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE,
                              CONSTRAINT `fk_asistencia_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `asistencia_detalle` (
                                      `id_asistencia_detalle` int(11) NOT NULL AUTO_INCREMENT,
                                      `id_asistencia` int(11) NOT NULL,
                                      `cedula` varchar(20) NOT NULL,
                                      `asistencia` enum('Presente','Ausente','Tardanza') NOT NULL,
                                      `observacion` varchar(255) DEFAULT NULL,
                                      `marcado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                      PRIMARY KEY (`id_asistencia_detalle`),
                                      UNIQUE KEY `uq_detalle_asistencia_estudiante` (`id_asistencia`,`cedula`),
                                      KEY `idx_detalle_cedula` (`cedula`),
                                      CONSTRAINT `fk_detalle_asistencia` FOREIGN KEY (`id_asistencia`) REFERENCES `asistencia` (`id_asistencia`) ON DELETE CASCADE ON UPDATE CASCADE,
                                      CONSTRAINT `fk_detalle_estudiante` FOREIGN KEY (`cedula`) REFERENCES `estudiantes` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seguimiento de estudiantes en riesgo / alertas
CREATE TABLE `seguimientos` (
                                `id_seguimiento` int(11) NOT NULL AUTO_INCREMENT,
                                `id_institucion` int(11) NOT NULL,
                                `cedula_estudiante` varchar(20) NOT NULL,
                                `id_asignacion` int(11) DEFAULT NULL,
                                `tipo` enum('Riesgo','Alerta','Seguimiento') NOT NULL DEFAULT 'Riesgo',
                                `porcentaje_asistencia` decimal(5,2) DEFAULT NULL,
                                `estado` enum('Abierto','En seguimiento','Resuelto') NOT NULL DEFAULT 'Abierto',
                                `observaciones` text DEFAULT NULL,
                                `creado_por` varchar(20) DEFAULT NULL,
                                `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                                `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                                `resuelto_en` datetime DEFAULT NULL,
                                PRIMARY KEY (`id_seguimiento`),
                                KEY `idx_seguimientos_institucion_estado` (`id_institucion`,`estado`),
                                KEY `idx_seguimientos_estudiante` (`cedula_estudiante`),
                                KEY `idx_seguimientos_asignacion` (`id_asignacion`),
                                KEY `idx_seguimientos_creado_por` (`creado_por`),
                                CONSTRAINT `fk_seguimientos_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE,
                                CONSTRAINT `fk_seguimientos_estudiante` FOREIGN KEY (`cedula_estudiante`) REFERENCES `estudiantes` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
                                CONSTRAINT `fk_seguimientos_asignacion` FOREIGN KEY (`id_asignacion`) REFERENCES `asignaciones` (`id_asignacion`) ON DELETE SET NULL ON UPDATE CASCADE,
                                CONSTRAINT `fk_seguimientos_creado_por` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 5. NOTIFICACIONES
-- =====================================================================

-- Mensaje enviado por un docente o administrador de la institución
CREATE TABLE `notificaciones` (
                                  `id` int(11) NOT NULL AUTO_INCREMENT,
                                  `id_institucion` int(11) NOT NULL,
                                  `cedula_emisor` varchar(20) NOT NULL,
                                  `tipo` varchar(50) NOT NULL DEFAULT 'Normal',
                                  `asunto` varchar(255) NOT NULL,
                                  `mensaje` text NOT NULL,
                                  `es_urgente` tinyint(1) NOT NULL DEFAULT 0,
                                  `canal` enum('Correo','Panel','Ambos') NOT NULL DEFAULT 'Ambos',
                                  `destinatarios` enum('Todos','Curso','Grupo','Individual') NOT NULL DEFAULT 'Todos',
                                  `id_asignacion` int(11) DEFAULT NULL,
                                  `estado` enum('Borrador','Enviada','Error') NOT NULL DEFAULT 'Enviada',
                                  `fecha_envio` datetime DEFAULT current_timestamp(),
                                  PRIMARY KEY (`id`),
                                  KEY `idx_notificaciones_institucion_fecha` (`id_institucion`,`fecha_envio`),
                                  KEY `fk_notificaciones_emisor` (`cedula_emisor`),
                                  KEY `fk_notificaciones_asignacion` (`id_asignacion`),
                                  CONSTRAINT `fk_notificaciones_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE CASCADE ON UPDATE CASCADE,
                                  CONSTRAINT `fk_notificaciones_emisor` FOREIGN KEY (`cedula_emisor`) REFERENCES `usuarios` (`cedula`) ON UPDATE CASCADE,
                                  CONSTRAINT `fk_notificaciones_asignacion` FOREIGN KEY (`id_asignacion`) REFERENCES `asignaciones` (`id_asignacion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Entrega y lectura por destinatario (bandeja)
CREATE TABLE `notificaciones_usuarios` (
                                           `id` int(11) NOT NULL AUTO_INCREMENT,
                                           `id_notificacion` int(11) NOT NULL,
                                           `cedula_destinatario` varchar(20) NOT NULL,
                                           `correo_destinatario` varchar(100) DEFAULT NULL,
                                           `estado_envio` enum('Pendiente','Entregado','Fallido') NOT NULL DEFAULT 'Pendiente',
                                           `estado` enum('no_leida','leida') NOT NULL DEFAULT 'no_leida',
                                           `fecha_recibido` datetime DEFAULT NULL,
                                           `fecha_lectura` datetime DEFAULT NULL,
                                           PRIMARY KEY (`id`),
                                           UNIQUE KEY `uq_notif_usuario` (`id_notificacion`,`cedula_destinatario`),
                                           KEY `idx_notif_destinatario_estado` (`cedula_destinatario`,`estado`),
                                           CONSTRAINT `fk_notif_usuarios_notificacion` FOREIGN KEY (`id_notificacion`) REFERENCES `notificaciones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
                                           CONSTRAINT `fk_notif_usuarios_destinatario` FOREIGN KEY (`cedula_destinatario`) REFERENCES `usuarios` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 6. AUDITORÍA
-- =====================================================================

CREATE TABLE `auditoria` (
                             `id_auditoria` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                             `id_institucion` int(11) DEFAULT NULL,
                             `cedula_actor` varchar(20) DEFAULT NULL,
                             `accion` varchar(50) NOT NULL,
                             `entidad` varchar(50) NOT NULL,
                             `id_entidad` varchar(50) DEFAULT NULL,
                             `detalle_antes` longtext DEFAULT NULL,
                             `detalle_despues` longtext DEFAULT NULL,
                             `ip_address` varchar(45) DEFAULT NULL,
                             `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
                             PRIMARY KEY (`id_auditoria`),
                             KEY `idx_auditoria_institucion_fecha` (`id_institucion`,`creado_en`),
                             KEY `idx_auditoria_actor` (`cedula_actor`),
                             KEY `idx_auditoria_entidad` (`entidad`,`id_entidad`),
                             CONSTRAINT `fk_auditoria_institucion` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones` (`id_institucion`) ON DELETE SET NULL ON UPDATE CASCADE,
                             CONSTRAINT `fk_auditoria_actor` FOREIGN KEY (`cedula_actor`) REFERENCES `usuarios` (`cedula`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- 7. VISTAS DE APOYO (estadísticas, historial, monitoreo)
--    % asistencia = (Presente + Tardanza) / total de clases registradas
-- =====================================================================

CREATE VIEW `v_asistencia_sesion` AS
SELECT a.`id_asistencia`, a.`id_asignacion`, a.`fecha`, a.`hora`, a.`cedula_profesor`,
       SUM(d.`asistencia` = 'Presente') AS `presentes`,
       SUM(d.`asistencia` = 'Tardanza') AS `tardanzas`,
       SUM(d.`asistencia` = 'Ausente')  AS `ausentes`,
       COUNT(d.`id_asistencia_detalle`) AS `total`,
       ROUND(100 * SUM(d.`asistencia` IN ('Presente','Tardanza')) / NULLIF(COUNT(d.`id_asistencia_detalle`), 0), 1) AS `porcentaje_asistencia`
FROM `asistencia` a
         LEFT JOIN `asistencia_detalle` d ON d.`id_asistencia` = a.`id_asistencia`
GROUP BY a.`id_asistencia`, a.`id_asignacion`, a.`fecha`, a.`hora`, a.`cedula_profesor`;

CREATE VIEW `v_asistencia_estudiante` AS
SELECT i.`cedula`, i.`id_asignacion`,
       COUNT(d.`id_asistencia_detalle`) AS `total_clases`,
       COALESCE(SUM(d.`asistencia` = 'Presente'), 0) AS `presentes`,
       COALESCE(SUM(d.`asistencia` = 'Tardanza'), 0) AS `tardanzas`,
       COALESCE(SUM(d.`asistencia` = 'Ausente'), 0)  AS `ausentes`,
       ROUND(100 * SUM(d.`asistencia` IN ('Presente','Tardanza')) / NULLIF(COUNT(d.`id_asistencia_detalle`), 0), 1) AS `porcentaje_asistencia`
FROM `inscripciones` i
         LEFT JOIN `asistencia` a ON a.`id_asignacion` = i.`id_asignacion`
         LEFT JOIN `asistencia_detalle` d ON d.`id_asistencia` = a.`id_asistencia` AND d.`cedula` = i.`cedula`
WHERE i.`estado` = 'Inscrito'
GROUP BY i.`cedula`, i.`id_asignacion`;