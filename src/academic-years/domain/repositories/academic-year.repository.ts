import { AcademicYear } from '../entities/academic-year.entity.js';
import { CreateAcademicYearDto } from '../../application/dtos/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../../application/dtos/update-academic-year.dto.js';

export const ACADEMIC_YEAR_REPOSITORY = Symbol('ACADEMIC_YEAR_REPOSITORY');

export interface IAcademicYearRepository {
  findAll(): Promise<AcademicYear[]>;
  findById(id: string): Promise<AcademicYear | null>;
  create(data: CreateAcademicYearDto): Promise<AcademicYear>;
  update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear | null>;
  remove(id: string): Promise<void>;
}
