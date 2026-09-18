## Contexto del Sistema

aplicación de gestión de notas escolares para un MVP/PoC. El sistema será utilizado inicialmente por una sola profesora y se implementará con **PostgreSQL** y **Prisma ORM (Prisma 8 / `@prisma/orm-postgres`)**. No se requiere sobreingeniería ni modelado de funcionalidades que no existen todavía.

> Esta sección describe el modelo de datos tal como está definido en `prisma/contract.prisma` (fuente de verdad). Los nombres de campo son camelCase porque así quedan también las columnas reales en la base de datos (no hay `@map` a nivel de campo, solo a nivel de tabla).
>
> Todos los campos de fecha (`birthDate`, `startDate`, `endDate`, `registrationDate`, `submissionDate`) usan el tipo `DateString` (texto plano de Postgres, `string` en TypeScript) y no `Date`/`Temporal` — se eligió así para evitar depender de `Temporal` global (no disponible en Node 24 sin polyfill) y porque es más simple para una API REST/JSON.

---

## 1. Descripción General de las Entidades (Tablas)

### Teacher (`teachers`)
- Representa a la profesora que usa el sistema (por ahora un solo registro, sin login/auth)
- Campos: `id` (uuid), `name`, `email` (único)
- Implementado en `src/teachers` (CRUD completo)

### AcademicYear (`academic_years`)
- Representa el año académico completo
- Campos: `id` (uuid), `yearName` (único, ej: "2024-A"), `startDate`, `endDate`, `teacherId` (FK)
- Restricciones: `yearName` debe ser único a nivel del sistema; FK hacia `Teacher`
- Implementado en `src/academic-years`

### Period (`periods`)
- Representa uno de los 4 períodos del año académico
- Campos: `id`, `academicYearId` (FK), `number` (1-4), `name`
- Restricciones:
  - FK hacia `AcademicYear`
  - UNIQUE(`academicYearId`, `number`) para evitar duplicados dentro del mismo año
- Implementado en `src/periods`. Al crear un `Period`, el servicio crea automáticamente sus 3 `Evaluation` (`NOTE_1`/`NOTE_2`/`EXAM`, pesos por defecto 35/35/30) para cumplir la regla de negocio de la sección 3 — no existe endpoint para crear/borrar evaluaciones sueltas, solo `PATCH` de peso.

### Student (`students`)
- Representa a cada estudiante matriculado
- Campos: `id`, `dni` (único), `firstName`, `lastName1`, `lastName2` (opcional), `gender` (opcional, enum `Gender`: `F`/`M`; va a la columna de género de la planilla Excel), `birthDate`, `email` (único)
- Restricciones: `dni` y `email` deben ser únicos en toda la base de datos
- Implementado en `src/students` (CRUD completo sobre Prisma; ver *Estado de implementación* al final)

### Subject (`subjects`)
- Representa una materia/curso
- Campos: `id`, `code` (único, ej: "MATE-01"), `name`, `description` (opcional)
- Restricción: `code` debe ser único a nivel del sistema
- Implementado en `src/subjects`

### Enrollment (`enrollments`)
- Vincula estudiante con materia específica para un año académico
- Campos: `id`, `studentId` (FK), `subjectId` (FK), `academicYearId` (FK), `registrationDate`
- Restricciones:
  - UNIQUE(`studentId`, `subjectId`, `academicYearId`) — una misma pareja estudiante-materia solo puede existir una vez por año académico (permite volver a inscribirse en años distintos)
- Implementado en `src/enrollments`

### Evaluation (`evaluations`)
- Representa la nota acumulada que tiene peso en el período (Nota 1, Nota 2, Examen)
- Campos: `id`, `periodId` (FK), `type` (enum `EvaluationType`: `NOTE_1`, `NOTE_2`, `EXAM`), `weight` (Float, porcentaje que representa esta evaluación en el período), `activityOrder` (Int, orden de despliegue de sus actividades)
- Restricciones:
  - FK hacia `Period`
  - UNIQUE(`periodId`, `type`) — cada período solo puede tener un `NOTE_1`, un `NOTE_2` y un `EXAM`
- Implementado en `src/evaluations`. `PATCH /evaluations/:id` valida que los 3 pesos del período sigan sumando 100.

### Activity (`activities`)
- Representa actividades individuales dentro de una evaluación
- Campos: `id`, `evaluationId` (FK), `name` (ej: "Tarea", "Quiz", "Proyecto"), `weight` (Float, porcentaje dentro de la evaluación), `description` (opcional)
- Restricciones:
  - FK hacia `Evaluation`
  - UNIQUE(`evaluationId`, `name`)
  - Una evaluación puede tener múltiples activities, y sus `weight` deben sumar 100%
- Una `Activity` se puede calificar de dos formas, mutuamente excluyentes (ver `SubActivity` y `Grade` abajo): directo con un `Grade`, o —si el docente la desglosa— calculada a partir de sus `SubActivity`.
- Implementado en `src/activities`. La suma de pesos se valida de forma perezosa al calcular notas (ver `src/grades`), no en cada `POST`/`PATCH` de actividad, porque se arman incrementalmente.

### SubActivity (`sub_activities`)
- Desglose **opcional** de una `Activity` en partes calificables por separado (ej. "Proyecto" → "Diseño" + "Código" + "Presentación"). Un solo nivel, no se anida más.
- Campos: `id`, `activityId` (FK), `name`, `weight` (Float, porcentaje dentro de la actividad), `description` (opcional)
- Restricciones:
  - FK hacia `Activity`
  - UNIQUE(`activityId`, `name`)
  - Si una `Activity` tiene sub-actividades, sus `weight` deben sumar 100% (igual que `Activity` dentro de `Evaluation`)
- Implementado en `src/sub-activities`, mismo patrón CRUD que `src/activities`.

### Grade (`grades`)
- Almacena el resultado individual de un estudiante en una actividad o sub-actividad específica
- Campos: `id`, `enrollmentId` (FK), `activityId` (FK, opcional), `subActivityId` (FK, opcional), `gradeValue` (Numeric(5,2), la nota del estudiante, escala 0-10), `submissionDate` (opcional), `status` (enum `GradeStatus`: `PENDING`, `SUBMITTED`, `GRADING`)
- Restricciones:
  - UNIQUE(`enrollmentId`, `activityId`) y UNIQUE(`enrollmentId`, `subActivityId`) — cada actividad o sub-actividad solo puede tener una calificación por enrollment
  - **`activityId` y `subActivityId` son mutuamente excluyentes**: una nota apunta a una `Activity` sin sub-actividades, o a una de sus `SubActivity`, nunca a ambas. Se valida en `GradesService.create()` (400 si vienen los dos o ninguno)
- **Nota:** el peso (`weight`) vive en `Activity`/`SubActivity`, no en `Grade` — es el mismo para todos los estudiantes, no algo por-alumno.
- Implementado en `src/grades`: CRUD de `Grade` + `GradeCalculationService` con la lógica de la sección 4, expuesta en `GET /enrollments/:enrollmentId/grades/activities/:activityId`, `.../evaluations/:evaluationId`, `.../periods/:periodId` y `.../year`.

### PeriodFile (`period_files`)
- Historial de archivos `.xlsx` generados por período y materia. El archivo vive en S3; la tabla guarda solo la referencia.
- Campos: `id`, `periodId` (FK), `subjectId` (FK), `fileName`, `storageKey` (único, key del objeto en S3), `generatedAt` (`TimestamptzString(3)`, texto de Postgres)
- Sin UNIQUE sobre (`periodId`, `subjectId`) a propósito: cada generación es un snapshot nuevo y coexisten varios por período. El año se obtiene vía `period.academicYearId`.
- Implementado en `src/period-files`: `POST /period-files` (`{ periodId, subjectId }`) genera y guarda; `GET /period-files?periodId&subjectId` lista (más reciente primero); `GET /period-files/:id/download` devuelve `{ url, fileName, expiresInSeconds }` con una URL prefirmada.
- Al generar, si existe un archivo de un período anterior de la misma materia y año, se parte del más reciente del período anterior más cercano (nunca del mismo período); si no, de `empty.xlsx`. Los alumnos se ubican por NIE (`dni`) para no desalinear notas anteriores; los nuevos van a la primera fila libre. Las evaluaciones sin calificar por completo quedan vacías en el Excel y se reportan en `incompleteStudents`.

---

## 2. Relaciones entre Tablas

```
Teacher 1──N AcademicYear 1──N Period 1──N Evaluation 1──N Activity 1──N Grade N──1 Enrollment N──1 Student
                                                                    │                                Enrollment N──1 Subject
                                                                    │                                Enrollment N──1 AcademicYear
                                                                    └──N SubActivity 1──N Grade
```

`Grade` cuelga de `Activity` O de `SubActivity` (nunca ambos) según si esa actividad fue desglosada.

---

## 3. Reglas de Negocio Críticas

### Estructura del cálculo por período:
- Cada período tiene **exactamente 3 evaluaciones**: `NOTE_1`, `NOTE_2` y `EXAM`
- Los pesos de las evaluaciones deben sumar 100%:
  - Ejemplo típico: NOTE_1 = 35%, NOTE_2 = 35%, EXAM = 30%
  - Estos valores se almacenan en `Evaluation.weight`

### Dentro de cada evaluación:
- Las actividades pueden ser:
  - Una sola actividad con 100% de peso, o
  - Múltiples actividades cuyos pesos (`Activity.weight`) sumen 100%
- Ejemplo Nota 1: Tarea(20%) + Quiz(30%) + Proyecto(50%) = 100%

### Dentro de cada actividad (opcional):
- Una `Activity` puede desglosarse en `SubActivity` cuyos pesos deben sumar 100%, igual que las actividades dentro de una evaluación
- Si una actividad no tiene sub-actividades, se califica directo con un `Grade`
- Ejemplo: Proyecto(35% de Nota 1) → Diseño(30%) + Código(30%) + Presentación(40%) = 100%

### Cálculo de notas:
1. **Nota de sub-actividad** (si existe) → Se obtiene directamente del campo `gradeValue` en `Grade`
2. **Nota de actividad** → Si no tiene sub-actividades, es el `gradeValue` directo de su `Grade`; si las tiene, se calcula ponderando cada sub-actividad por su `weight`
3. **Nota de evaluación (ej. Nota 1)** → Se calcula ponderando cada actividad (ya resuelta por el paso 2) por su `weight` dentro de la evaluación
4. **Nota del período** → Se calcula como: NOTE_1 × weight + NOTE_2 × weight + EXAM × weight
5. **Nota final del año** → Promedio simple de las notas finales de los 4 períodos

### Restricciones de integridad (reflejadas en `prisma/contract.prisma`):
- `AcademicYear.yearName`: UNIQUE
- `Period`: UNIQUE(`academicYearId`, `number`)
- `Student.dni`, `Student.email`: UNIQUE
- `Subject.code`: UNIQUE
- `Enrollment`: UNIQUE(`studentId`, `subjectId`, `academicYearId`)
- `Evaluation`: UNIQUE(`periodId`, `type`)
- `Activity`: UNIQUE(`evaluationId`, `name`)
- `SubActivity`: UNIQUE(`activityId`, `name`)
- `Grade`: UNIQUE(`enrollmentId`, `activityId`) y UNIQUE(`enrollmentId`, `subActivityId`)

---

## 4. Lógica de Negocio Implementable

### Cálculo de Nota de Actividad (solo si tiene sub-actividades):
```
Nota(Activity) = SUM(gradeValue_subActivity_i × weight_subActivity_i) / 100
donde i recorre todas las sub-actividades de esa actividad
y los weights suman 100%
```

Ejemplo numérico (Actividad "Proyecto", weight=35% dentro de Nota 1):
- Diseño: gradeValue=7, weight=30 → contribución = 7 × 0.30 = 2.1
- Código: gradeValue=8, weight=30 → contribución = 8 × 0.30 = 2.4
- Presentación: gradeValue=9, weight=40 → contribución = 9 × 0.40 = 3.6
- Nota(Proyecto) = 2.1 + 2.4 + 3.6 = **8.1**

Si la actividad NO tiene sub-actividades, su nota es directamente el `gradeValue` de su `Grade` (como en el ejemplo de Nota 1 más abajo).

### Cálculo de Nota de Evaluación (ej. Nota 1):
```
NOTE_1 = SUM(gradeValue_activity_i × weight_activity_i) / 100
donde i recorre todas las actividades de esa evaluación
y los weights suman 100%
```

Ejemplo numérico:
- Tarea: gradeValue=8, weight=20 → contribución = 8 × 0.20 = 1.6
- Quiz: gradeValue=9, weight=30 → contribución = 9 × 0.30 = 2.7
- Proyecto: gradeValue=10, weight=50 → contribución = 10 × 0.50 = 5.0
- NOTE_1 total = 1.6 + 2.7 + 5.0 = **9.3**

### Cálculo de Nota del Período:
```
NOTA_PERIODO =
    (NOTE_1 × weight_Note1 / 100) +
    (NOTE_2 × weight_Note2 / 100) +
    (EXAM × weight_Exam / 100)
```

### Cálculo de Nota Final del Año:
```
NOTA_FINAL_ANO =
    AVG(NOTA_PERIODO_1, NOTA_PERIODO_2,
        NOTA_PERIODO_3, NOTA_PERIODO_4)
```

---

## 5. Estado de implementación

- **Prisma contract** (`prisma/contract.prisma`, `prisma/db.ts`): modelo completo definido y funcionando con Prisma 8 (`db.orm.public.<Model>`), incluyendo `Teacher`.
- **`src/students`**, **`src/teachers`**, **`src/academic-years`**, **`src/periods`**, **`src/subjects`**, **`src/enrollments`**, **`src/evaluations`**, **`src/activities`**, **`src/sub-activities`**, **`src/grades`**: CRUD completo (entidad, repositorio Prisma, servicio, controlador REST) siguiendo el mismo patrón por capas, todos conectados en `AppModule`. `src/grades` además expone el cálculo de notas de la sección 4, incluyendo el desglose opcional por sub-actividad.
- **Validación de entrada**: `class-validator` + `class-transformer` con `ValidationPipe({ whitelist: true, transform: true })` global (`src/main.ts`). Los DTOs de creación/actualización de cada módulo están decorados.
- **`src/shared/prisma-error.util.ts`**: traduce violaciones de unicidad/FK de Postgres (`sqlState` 23505/23503) a `ConflictException`/`BadRequestException`.
- **`src/period-files`**: generación y historial de archivos por período/materia (ver *PeriodFile*), usa `GradeCalculationService`, `FillPeriodNotesUseCase` y `S3Service`.
- **`src/shared/storage`**: `S3Service` global (`put` sin sobrescribir, `getBuffer`, `getDownloadUrl` prefirmada, `delete`). Config por `S3_*` en `.env` (ver `.env.example`); MinIO local con `docker compose up -d minio minio-init`, o un bucket real de AWS quitando `S3_ENDPOINT`/`S3_FORCE_PATH_STYLE`.
- **`src/shared/excel`**: `FillPeriodNotesUseCase` rellena la plantilla (`empty.xlsx` o un archivo previo) con los alumnos y las notas de un período y devuelve un `Buffer`; el mapeo de columnas por período está en `domain/helpers/period-mapped.ts`. El caso de uso `PocExcelUseCase` (`GET /excel/poc`) sigue siendo el POC original con datos hardcodeados.
- **Pendiente**: login/autenticación para el docente (fuera de alcance por ahora, sistema de un solo usuario), tests automatizados de los módulos nuevos.
