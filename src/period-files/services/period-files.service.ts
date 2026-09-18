import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PERIOD_FILE_REPOSITORY } from '../domain/repositories/period-file.repository.js';
import type { IPeriodFileRepository } from '../domain/repositories/period-file.repository.js';
import { PeriodFile } from '../domain/entities/period-file.entity.js';
import { GeneratePeriodFileDto } from '../application/dtos/generate-period-file.dto.js';
import { FindPeriodFilesQueryDto } from '../application/dtos/find-period-files-query.dto.js';
import { PERIOD_REPOSITORY } from '../../periods/domain/repositories/period.repository.js';
import type { IPeriodRepository } from '../../periods/domain/repositories/period.repository.js';
import { Period } from '../../periods/domain/entities/period.entity.js';
import { SUBJECT_REPOSITORY } from '../../subjects/domain/repositories/subject.repository.js';
import type { ISubjectRepository } from '../../subjects/domain/repositories/subject.repository.js';
import { ACADEMIC_YEAR_REPOSITORY } from '../../academic-years/domain/repositories/academic-year.repository.js';
import type { IAcademicYearRepository } from '../../academic-years/domain/repositories/academic-year.repository.js';
import { ENROLLMENT_REPOSITORY } from '../../enrollments/domain/repositories/enrollment.repository.js';
import type { IEnrollmentRepository } from '../../enrollments/domain/repositories/enrollment.repository.js';
import { STUDENT_REPOSITORY } from '../../students/domain/repositories/student.repository.js';
import type { IStudentRepository } from '../../students/domain/repositories/student.repository.js';
import { Student } from '../../students/domain/entities/student.entity.js';
import { EVALUATION_REPOSITORY } from '../../evaluations/domain/repositories/evaluation.repository.js';
import type { IEvaluationRepository } from '../../evaluations/domain/repositories/evaluation.repository.js';
import { GradeCalculationService } from '../../grades/services/grade-calculation.service.js';
import { FillPeriodNotesUseCase } from '../../shared/excel/application/use-cases/fill-period-notes.js';
import type { PeriodNotesStudent } from '../../shared/excel/application/use-cases/fill-period-notes.js';
import { S3Service } from '../../shared/storage/s3.service.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 300;

const NOTE_FIELD_BY_EVALUATION_TYPE = {
  NOTE_1: 'FNote',
  NOTE_2: 'SNote',
  EXAM: 'ENote',
} as const;

export type GeneratePeriodFileResult = {
  file: PeriodFile;
  /** Archivo de período anterior sobre el que se construyó; `null` si se partió de la plantilla vacía. */
  basedOn: { periodFileId: string; periodNumber: number } | null;
  /** Alumnos con evaluaciones sin calificar por completo: esas celdas quedaron vacías en el Excel. */
  incompleteStudents: { dni: string; name: string; missing: string[] }[];
};

function formatStudentName(student: Student): string {
  const lastNames = [student.lastName1, student.lastName2].filter(Boolean).join(' ');
  return `${lastNames}, ${student.firstName}`.toLocaleUpperCase('es');
}

function compareStudents(a: Student, b: Student): number {
  return formatStudentName(a).localeCompare(formatStudentName(b), 'es');
}

@Injectable()
export class PeriodFilesService {
  private readonly logger = new Logger(PeriodFilesService.name);

  constructor(
    @Inject(PERIOD_FILE_REPOSITORY) private readonly repository: IPeriodFileRepository,
    @Inject(PERIOD_REPOSITORY) private readonly periodRepository: IPeriodRepository,
    @Inject(SUBJECT_REPOSITORY) private readonly subjectRepository: ISubjectRepository,
    @Inject(ACADEMIC_YEAR_REPOSITORY) private readonly academicYearRepository: IAcademicYearRepository,
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: IStudentRepository,
    @Inject(EVALUATION_REPOSITORY) private readonly evaluationRepository: IEvaluationRepository,
    private readonly gradeCalculationService: GradeCalculationService,
    private readonly fillPeriodNotes: FillPeriodNotesUseCase,
    private readonly s3Service: S3Service,
  ) {}

  findAll(query: FindPeriodFilesQueryDto): Promise<PeriodFile[]> {
    return this.repository.findAll(query);
  }

  async getDownloadUrl(id: string): Promise<{ url: string; fileName: string; expiresInSeconds: number }> {
    const file = await this.repository.findById(id);
    if (!file) {
      throw new NotFoundException(`PeriodFile ${id} not found`);
    }
    const url = await this.s3Service.getDownloadUrl(file.storageKey, {
      fileName: file.fileName,
      expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS,
    });
    return { url, fileName: file.fileName, expiresInSeconds: DOWNLOAD_URL_EXPIRES_IN_SECONDS };
  }

  async generate({ periodId, subjectId }: GeneratePeriodFileDto): Promise<GeneratePeriodFileResult> {
    const period = await this.periodRepository.findById(periodId);
    if (!period) {
      throw new NotFoundException(`Period ${periodId} not found`);
    }
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found`);
    }
    const academicYear = await this.academicYearRepository.findById(period.academicYearId);
    if (!academicYear) {
      throw new NotFoundException(`AcademicYear ${period.academicYearId} not found`);
    }

    const enrollments = await this.enrollmentRepository.findAllBySubjectAndAcademicYear(
      subjectId,
      period.academicYearId,
    );
    if (enrollments.length === 0) {
      throw new BadRequestException(
        `Subject ${subject.code} has no enrolled students in academic year ${academicYear.yearName}.`,
      );
    }

    const evaluations = await this.evaluationRepository.findAllByPeriodId(periodId);
    const enrolledStudents = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await this.studentRepository.findById(enrollment.studentId);
        if (!student) {
          throw new NotFoundException(`Student ${enrollment.studentId} not found`);
        }
        return { enrollment, student };
      }),
    );
    enrolledStudents.sort((a, b) => compareStudents(a.student, b.student));

    const gradedStudents = await Promise.all(
      enrolledStudents.map(async ({ enrollment, student }) => {
        const row: PeriodNotesStudent = {
          nie: student.dni,
          name: formatStudentName(student),
          gender: student.gender,
          FNote: null,
          SNote: null,
          ENote: null,
        };
        const missing: string[] = [];
        for (const evaluation of evaluations) {
          try {
            const result = await this.gradeCalculationService.getEvaluationGrade(enrollment.id, evaluation.id);
            row[NOTE_FIELD_BY_EVALUATION_TYPE[evaluation.type]] = result.grade;
          } catch (error) {
            // Faltan calificaciones para esa evaluación: se deja la celda vacía y se reporta.
            if (!(error instanceof BadRequestException)) throw error;
            missing.push(evaluation.type);
          }
        }
        return { row, missing, student };
      }),
    );

    const base = await this.findBaseFile(subjectId, period);
    const baseFile = base ? await this.s3Service.getBuffer(base.file.storageKey) : undefined;

    const buffer = await this.fillPeriodNotes.execute({
      periodNumber: period.number,
      students: gradedStudents.map(({ row }) => row),
      baseFile,
    });

    const id = randomUUID();
    const generatedAt = new Date().toISOString();
    const storageKey = `${period.academicYearId}/${subjectId}/${periodId}/${generatedAt.replace(/[-:.]/g, '')}_${id}.xlsx`;
    const fileName = `${subject.code}_P${period.number}_${academicYear.yearName}.xlsx`.replace(
      /[^A-Za-z0-9._-]/g,
      '_',
    );

    await this.s3Service.put(storageKey, buffer, { contentType: XLSX_CONTENT_TYPE });

    let file: PeriodFile;
    try {
      file = await this.repository.create({ id, periodId, subjectId, fileName, storageKey, generatedAt });
    } catch (error) {
      await this.s3Service.delete(storageKey).catch((cleanupError) => {
        this.logger.error(`Could not remove orphan object ${storageKey}`, cleanupError);
      });
      rethrowAsHttpException(error);
    }

    return {
      file,
      basedOn: base ? { periodFileId: base.file.id, periodNumber: base.periodNumber } : null,
      incompleteStudents: gradedStudents
        .filter(({ missing }) => missing.length > 0)
        .map(({ student, missing }) => ({ dni: student.dni, name: formatStudentName(student), missing })),
    };
  }

  /**
   * Última versión generada del período anterior más cercano que tenga archivo para esta materia.
   * Nunca parte de un archivo del mismo período (o posterior), para que regenerar sea repetible.
   */
  private async findBaseFile(
    subjectId: string,
    period: Period,
  ): Promise<{ file: PeriodFile; periodNumber: number } | null> {
    const periods = await this.periodRepository.findAllByAcademicYearId(period.academicYearId);
    const earlierPeriods = periods.filter((p) => p.number < period.number).sort((a, b) => b.number - a.number);

    for (const earlier of earlierPeriods) {
      const [latest] = await this.repository.findAll({ periodId: earlier.id, subjectId });
      if (latest) {
        return { file: latest, periodNumber: earlier.number };
      }
    }
    return null;
  }
}
