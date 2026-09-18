# Integración pendiente: llenar Excel con notas reales

> Referencia para cuando se conecte `src/shared/excel` (hoy usa datos hardcodeados en `FakeStudentsNotes`) con el modelo de notas real (`src/grades`). No implementado todavía — es la guía para hacerlo.

## Decisión de diseño: calcular al exportar, no persistir el resultado

Las notas de `Evaluation`/`Period`/año **no se guardan calculadas** en la base de datos — se calculan en el momento a partir de las notas de actividad/sub-actividad (`GradeCalculationService`, ver `CLAUDE.md` sección 4). Se decidió así para el Excel también:

- Si se persistiera el cálculo (ej. una columna `Period.note1Cache`), cada corrección de una nota de actividad obligaría a recalcular y re-guardar en cascada (actividad → evaluación → período → año) para no dejar datos desactualizados — complejidad innecesaria para un PoC de una sola profesora.
- Como el cálculo es barato (unas pocas lecturas a la DB + aritmética simple), generar el Excel llamando a `GradeCalculationService.getPeriodGrade()` por estudiante en el momento de la exportación es suficiente y siempre refleja el estado real.
- Si en el futuro el volumen de estudiantes/materias crece y la exportación se siente lenta, ahí sí se justificaría cachear — no antes.

## Prerrequisito ya implementado

`IEnrollmentRepository.findAllBySubjectAndAcademicYear(subjectId, academicYearId)` (`src/enrollments/domain/repositories/enrollment.repository.ts`) permite listar directamente las inscripciones de una materia en un año académico, sin traer todas las inscripciones del sistema y filtrar en memoria. También expuesto como `GET /enrollments?subjectId=...&academicYearId=...`.

## Caso de uso de referencia

```typescript
// src/shared/excel/application/use-cases/build-period-notes.ts
import { Inject, Injectable } from '@nestjs/common';
import { ENROLLMENT_REPOSITORY } from '../../../../enrollments/domain/repositories/enrollment.repository.js';
import type { IEnrollmentRepository } from '../../../../enrollments/domain/repositories/enrollment.repository.js';
import { STUDENT_REPOSITORY } from '../../../../students/domain/repositories/student.repository.js';
import type { IStudentRepository } from '../../../../students/domain/repositories/student.repository.js';
import { GradeCalculationService } from '../../../../grades/services/grade-calculation.service.js';

export type StudentPeriodNotes = {
  nie: string;
  name: string;
  FNote: number; // NOTE_1
  SNote: number; // NOTE_2
  ENote: number; // EXAM
};

@Injectable()
export class BuildPeriodNotesUseCase {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: IStudentRepository,
    private readonly gradeCalculationService: GradeCalculationService,
  ) {}

  async execute(subjectId: string, academicYearId: string, periodId: string): Promise<StudentPeriodNotes[]> {
    const enrollments = await this.enrollmentRepository.findAllBySubjectAndAcademicYear(
      subjectId,
      academicYearId,
    );

    return Promise.all(
      enrollments.map(async (enrollment) => {
        const [student, periodGrade] = await Promise.all([
          this.studentRepository.findById(enrollment.studentId),
          this.gradeCalculationService.getPeriodGrade(enrollment.id, periodId),
        ]);

        const note1 = periodGrade.evaluations.find((e) => e.type === 'NOTE_1')!.grade;
        const note2 = periodGrade.evaluations.find((e) => e.type === 'NOTE_2')!.grade;
        const exam = periodGrade.evaluations.find((e) => e.type === 'EXAM')!.grade;

        return {
          nie: student!.dni,
          name: `${student!.firstName} ${student!.lastName1}`,
          FNote: note1,
          SNote: note2,
          ENote: exam,
        };
      }),
    );
  }
}
```

## Dónde conectarlo

En `src/shared/excel/application/use-cases/poc-excel.ts`, reemplazar el bucle sobre `FakeStudentsNotes` (líneas 24-25):

```typescript
for (let rowPosition = 0; rowPosition < FakeStudentsNotes.length; rowPosition++){
  const student = FakeStudentsNotes[rowPosition]
```

por:

```typescript
const students = await this.buildPeriodNotesUseCase.execute(subjectId, academicYearId, periodId);
for (let rowPosition = 0; rowPosition < students.length; rowPosition++){
  const student = students[rowPosition]
```

(inyectando `BuildPeriodNotesUseCase` en el constructor de `PocExcelUseCase`, y registrándolo como provider en `excel.module.ts` junto con `EnrollmentsModule`, `StudentsModule` y `GradesModule` como imports).

`subjectId`, `academicYearId` y `periodId` tendrían que venir como parámetros del endpoint que dispare la exportación (hoy `GET /excel/poc?period=First|Second` solo recibe el período).

## Puntos a resolver al implementar

- **Estudiante con notas incompletas**: `getPeriodGrade()` lanza `BadRequestException` si a alguna evaluación le falta una actividad por calificar. Para el Excel conviene envolver esa llamada en un `try/catch` por estudiante dentro del `map` (dejar la celda vacía o marcarla en vez de tumbar toda la exportación).
- **Mapeo de período**: `PeriodMapped` (`period-mapped.ts`) hoy tiene columnas para `First`/`Second`; falta extenderlo a los 4 períodos si se van a exportar todos.
- **Nota final del período**: si el Excel también necesita el total ponderado del período (no solo NOTE_1/NOTE_2/EXAM por separado), `periodGrade.grade` ya lo trae.
