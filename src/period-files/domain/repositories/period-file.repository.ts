import { PeriodFile } from '../entities/period-file.entity.js';

export const PERIOD_FILE_REPOSITORY = Symbol('PERIOD_FILE_REPOSITORY');

export type CreatePeriodFileInput = {
  id: string;
  periodId: string;
  subjectId: string;
  fileName: string;
  storageKey: string;
  generatedAt: string;
};

export type FindPeriodFilesFilter = {
  periodId?: string;
  subjectId?: string;
};

export interface IPeriodFileRepository {
  /** Más reciente primero. */
  findAll(filter: FindPeriodFilesFilter): Promise<PeriodFile[]>;
  findById(id: string): Promise<PeriodFile | null>;
  create(data: CreatePeriodFileInput): Promise<PeriodFile>;
}
