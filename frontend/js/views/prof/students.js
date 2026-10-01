import { card, table, progress } from "../../ui/components.js";

export const profStudents = () =>
  card(
    "Alumnos en mis cursos",
    table(["Estudiante", "Curso", "Asistencias", "Porcentaje"], [
      ["Ana Torres", "Cálculo I", "27/28", progress(96)],
      ["Bruno Díaz", "Cálculo I", "24/28", progress(86)],
      ["Camila Ríos", "Programación", "20/28", progress(71)],
      ["Elena Paz", "Programación", "28/28", progress(100)],
    ])
  );
