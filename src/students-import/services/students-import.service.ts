import { BadRequestException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { STUDENT_REPOSITORY } from '../../students/domain/repositories/student.repository.js';
import type { IStudentRepository } from '../../students/domain/repositories/student.repository.js';
import { GENDERS, Student, type Gender } from '../../students/domain/entities/student.entity.js';
import { ENROLLMENT_REPOSITORY } from '../../enrollments/domain/repositories/enrollment.repository.js';
import type { IEnrollmentRepository } from '../../enrollments/domain/repositories/enrollment.repository.js';
import { SUBJECT_REPOSITORY } from '../../subjects/domain/repositories/subject.repository.js';
import type { ISubjectRepository } from '../../subjects/domain/repositories/subject.repository.js';
import { ACADEMIC_YEAR_REPOSITORY } from '../../academic-years/domain/repositories/academic-year.repository.js';
import type { IAcademicYearRepository } from '../../academic-years/domain/repositories/academic-year.repository.js';
import { ParseStudentsToJson } from '../../shared/excel/application/use-cases/parse-students-to-json.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';
import { ImportStudentsDto } from '../application/dtos/import-students.dto.js';

/**
 * - `create`: el estudiante no existe; se crea y se inscribe.
 * - `enroll`: ya existe en el catálogo; solo se inscribe.
 * - `skip`: ya estaba inscrito en esta materia y año; no se hace nada (salvo completar el género).
 * - `error`: la fila no se puede importar; `message` dice por qué.
 */
export type ImportRowStatus = 'create' | 'enroll' | 'skip' | 'error';

export type ImportRowResult = {
  row: number;
  nie: string;
  name: string;
  gender: Gender | null;
  status: ImportRowStatus;
  message?: string;
};

export type ImportStudentsResult = {
  dryRun: boolean;
  summary: Record<ImportRowStatus, number>;
  rows: ImportRowResult[];
};

type PlannedRow = ImportRowResult & {
  firstName?: string;
  lastName1?: string;
  existing?: Student;
  completesGender?: boolean;
};

// `done` distingue la vista previa («se inscribe») del resultado ya aplicado («se inscribió»).
function existingRowMessage(status: 'enroll' | 'skip', completesGender: boolean, done: boolean): string {
  const gender = completesGender ? (done ? 'se completó el género' : 'se completa el género') : null;
  if (status === 'skip') return gender ? `Ya inscrito; ${gender}.` : 'Ya está inscrito en esta materia.';
  const enroll = done ? 'se inscribió' : 'se inscribe';
  return `Ya existe en el catálogo; ${[enroll, gender].filter(Boolean).join(' y ')}.`;
}

function parseName(raw: string): { firstName: string; lastName1: string } | null {
  const [lastNames = '', ...rest] = raw.split(',');
  const clean = (text: string) => text.trim().replace(/\s+/g, ' ');
  const lastName1 = clean(lastNames);
  const firstName = clean(rest.join(','));
  return lastName1 && firstName ? { firstName, lastName1 } : null;
}

// `undefined` = valor no reconocido; `null` = celda vacía (el género es opcional).
function parseGender(raw: string): Gender | null | undefined {
  const value = raw.trim().toUpperCase();
  if (!value) return null;
  return (GENDERS as readonly string[]).includes(value) ? (value as Gender) : undefined;
}

function describeError(error: unknown): string {
  try {
    rethrowAsHttpException(error);
  } catch (translated) {
    return translated instanceof HttpException ? translated.message : 'Unexpected error';
  }
}

@Injectable()
export class StudentsImportService {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: IStudentRepository,
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(SUBJECT_REPOSITORY) private readonly subjectRepository: ISubjectRepository,
    @Inject(ACADEMIC_YEAR_REPOSITORY) private readonly academicYearRepository: IAcademicYearRepository,
    private readonly parseStudentsToJson: ParseStudentsToJson,
  ) {}

  async import(file: Buffer, { subjectId, academicYearId, dryRun = false }: ImportStudentsDto): Promise<ImportStudentsResult> {
    const [subject, academicYear] = await Promise.all([
      this.subjectRepository.findById(subjectId),
      this.academicYearRepository.findById(academicYearId),
    ]);
    if (!subject) throw new NotFoundException(`Subject ${subjectId} not found`);
    if (!academicYear) throw new NotFoundException(`AcademicYear ${academicYearId} not found`);

    const parsedRows = await this.parseStudentsToJson.execute(file);
    if (parsedRows.length === 0) {
      throw new BadRequestException('The file has no students. Expected columns: nie | name | gender.');
    }

    const enrollments = await this.enrollmentRepository.findAllBySubjectAndAcademicYear(subjectId, academicYearId);
    const enrolledStudentIds = new Set(enrollments.map((enrollment) => enrollment.studentId));

    const planned = await this.plan(parsedRows, enrolledStudentIds);
    if (!dryRun) {
      await this.apply(planned, subjectId, academicYearId);
    }

    const rows: ImportRowResult[] = planned.map(({ row, nie, name, gender, status, message }) => ({
      row,
      nie,
      name,
      gender,
      status,
      message,
    }));
    const summary: Record<ImportRowStatus, number> = { create: 0, enroll: 0, skip: 0, error: 0 };
    for (const { status } of rows) summary[status]++;

    return { dryRun, summary, rows };
  }

  private async plan(
    parsedRows: Awaited<ReturnType<ParseStudentsToJson['execute']>>,
    enrolledStudentIds: Set<string>,
  ): Promise<PlannedRow[]> {
    const firstRowByNie = new Map<string, number>();
    const planned: PlannedRow[] = [];

    for (const { row, nie, name, gender: rawGender } of parsedRows) {
      const gender = parseGender(rawGender);
      const base = { row, nie, name, gender: gender ?? null };
      const fail = (message: string): PlannedRow => ({ ...base, status: 'error', message });

      if (!nie) {
        planned.push(fail('Falta el NIE.'));
        continue;
      }
      const parsedName = parseName(name);
      if (!parsedName) {
        planned.push(fail('El nombre debe tener el formato «APELLIDOS, NOMBRES».'));
        continue;
      }
      if (gender === undefined) {
        planned.push(fail(`Género no reconocido: «${rawGender}». Usa F o M.`));
        continue;
      }
      const firstSeenAt = firstRowByNie.get(nie);
      if (firstSeenAt !== undefined) {
        planned.push(fail(`NIE repetido en el archivo (ya aparece en la fila ${firstSeenAt}).`));
        continue;
      }
      firstRowByNie.set(nie, row);

      const existing = await this.studentRepository.findByDni(nie);
      const completesGender = existing !== null && existing.gender === null && gender !== null;
      if (!existing) {
        planned.push({ ...base, ...parsedName, status: 'create' });
      } else {
        const status = enrolledStudentIds.has(existing.id) ? 'skip' : 'enroll';
        planned.push({
          ...base,
          existing,
          completesGender,
          status,
          message: existingRowMessage(status, completesGender, false),
        });
      }
    }
    return planned;
  }

  /** Aplica el plan fila por fila. No es transaccional: cada fila informa su propio resultado. */
  private async apply(planned: PlannedRow[], subjectId: string, academicYearId: string): Promise<void> {
    const registrationDate = new Date().toISOString().slice(0, 10);

    for (const item of planned) {
      if (item.status === 'error') continue;

      try {
        let student = item.existing;
        if (student && item.completesGender) {
          await this.studentRepository.update(student.id, { gender: item.gender! });
        }
        if (!student) {
          student = await this.studentRepository.create({
            dni: item.nie,
            firstName: item.firstName!,
            lastName1: item.lastName1!,
            gender: item.gender ?? undefined,
          });
        }
        if (item.status !== 'skip') {
          await this.enrollmentRepository.create({
            studentId: student.id,
            subjectId,
            academicYearId,
            registrationDate,
          });
        }
        if (item.existing && item.status !== 'create') {
          item.message = existingRowMessage(item.status, item.completesGender ?? false, true);
        }
      } catch (error) {
        item.status = 'error';
        item.message = describeError(error);
      }
    }
  }
}
