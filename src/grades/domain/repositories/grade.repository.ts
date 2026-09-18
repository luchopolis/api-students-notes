import { Grade } from '../entities/grade.entity.js';
import { CreateGradeDto } from '../../application/dtos/create-grade.dto.js';
import { UpdateGradeDto } from '../../application/dtos/update-grade.dto.js';

export const GRADE_REPOSITORY = Symbol('GRADE_REPOSITORY');

export interface IGradeRepository {
  findAllByEnrollmentId(enrollmentId: string): Promise<Grade[]>;
  findById(id: string): Promise<Grade | null>;
  findByEnrollmentAndActivity(enrollmentId: string, activityId: string): Promise<Grade | null>;
  create(data: CreateGradeDto): Promise<Grade>;
  update(id: string, data: UpdateGradeDto): Promise<Grade | null>;
  remove(id: string): Promise<void>;
}
