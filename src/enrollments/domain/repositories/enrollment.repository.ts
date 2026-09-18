import { Enrollment } from '../entities/enrollment.entity.js';
import { CreateEnrollmentDto } from '../../application/dtos/create-enrollment.dto.js';

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');

export interface IEnrollmentRepository {
  findAll(): Promise<Enrollment[]>;
  findAllBySubjectAndAcademicYear(subjectId: string, academicYearId: string): Promise<Enrollment[]>;
  findAllByAcademicYearId(academicYearId: string): Promise<Enrollment[]>;
  findById(id: string): Promise<Enrollment | null>;
  create(data: CreateEnrollmentDto): Promise<Enrollment>;
  remove(id: string): Promise<void>;
}
