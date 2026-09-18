import { Period } from '../entities/period.entity.js';
import { UpdatePeriodDto } from '../../application/dtos/update-period.dto.js';

export const PERIOD_REPOSITORY = Symbol('PERIOD_REPOSITORY');

export type CreatePeriodInput = {
  academicYearId: string;
  number: number;
  name: string;
};

export interface IPeriodRepository {
  findAllByAcademicYearId(academicYearId: string): Promise<Period[]>;
  findById(id: string): Promise<Period | null>;
  create(data: CreatePeriodInput): Promise<Period>;
  update(id: string, data: UpdatePeriodDto): Promise<Period | null>;
  remove(id: string): Promise<void>;
}
