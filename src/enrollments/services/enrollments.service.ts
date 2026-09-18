import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IEnrollmentRepository } from '../domain/repositories/enrollment.repository.js';
import { ENROLLMENT_REPOSITORY } from '../domain/repositories/enrollment.repository.js';
import { Enrollment } from '../domain/entities/enrollment.entity.js';
import { CreateEnrollmentDto } from '../application/dtos/create-enrollment.dto.js';
import { FindEnrollmentsQueryDto } from '../application/dtos/find-enrollments-query.dto.js';
import { STUDENT_REPOSITORY } from '../../students/domain/repositories/student.repository.js';
import type { IStudentRepository } from '../../students/domain/repositories/student.repository.js';
import { SUBJECT_REPOSITORY } from '../../subjects/domain/repositories/subject.repository.js';
import type { ISubjectRepository } from '../../subjects/domain/repositories/subject.repository.js';
import { ACADEMIC_YEAR_REPOSITORY } from '../../academic-years/domain/repositories/academic-year.repository.js';
import type { IAcademicYearRepository } from '../../academic-years/domain/repositories/academic-year.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY) private readonly repository: IEnrollmentRepository,
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: IStudentRepository,
    @Inject(SUBJECT_REPOSITORY) private readonly subjectRepository: ISubjectRepository,
    @Inject(ACADEMIC_YEAR_REPOSITORY) private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  findAll(query: FindEnrollmentsQueryDto = {}): Promise<Enrollment[]> {
    const { subjectId, academicYearId } = query;
    if (subjectId && !academicYearId) {
      throw new BadRequestException('academicYearId is required when filtering by subjectId.');
    }
    if (subjectId && academicYearId) {
      return this.repository.findAllBySubjectAndAcademicYear(subjectId, academicYearId);
    }
    if (academicYearId) {
      return this.repository.findAllByAcademicYearId(academicYearId);
    }
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.repository.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${id} not found`);
    }
    return enrollment;
  }

  async create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const [student, subject, academicYear] = await Promise.all([
      this.studentRepository.findById(data.studentId),
      this.subjectRepository.findById(data.subjectId),
      this.academicYearRepository.findById(data.academicYearId),
    ]);
    if (!student) throw new NotFoundException(`Student ${data.studentId} not found`);
    if (!subject) throw new NotFoundException(`Subject ${data.subjectId} not found`);
    if (!academicYear) throw new NotFoundException(`AcademicYear ${data.academicYearId} not found`);

    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
