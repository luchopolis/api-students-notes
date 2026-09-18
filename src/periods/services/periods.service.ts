import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPeriodRepository } from '../domain/repositories/period.repository.js';
import { PERIOD_REPOSITORY } from '../domain/repositories/period.repository.js';
import { Period } from '../domain/entities/period.entity.js';
import { CreatePeriodDto } from '../application/dtos/create-period.dto.js';
import { UpdatePeriodDto } from '../application/dtos/update-period.dto.js';
import { ACADEMIC_YEAR_REPOSITORY } from '../../academic-years/domain/repositories/academic-year.repository.js';
import type { IAcademicYearRepository } from '../../academic-years/domain/repositories/academic-year.repository.js';
import { EVALUATION_REPOSITORY } from '../../evaluations/domain/repositories/evaluation.repository.js';
import type { IEvaluationRepository } from '../../evaluations/domain/repositories/evaluation.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

const DEFAULT_EVALUATIONS = [
  { type: 'NOTE_1', weight: 35, activityOrder: 1 },
  { type: 'NOTE_2', weight: 35, activityOrder: 2 },
  { type: 'EXAM', weight: 30, activityOrder: 3 },
] as const;

@Injectable()
export class PeriodsService {
  constructor(
    @Inject(PERIOD_REPOSITORY) private readonly repository: IPeriodRepository,
    @Inject(ACADEMIC_YEAR_REPOSITORY) private readonly academicYearRepository: IAcademicYearRepository,
    @Inject(EVALUATION_REPOSITORY) private readonly evaluationRepository: IEvaluationRepository,
  ) {}

  findAllByAcademicYearId(academicYearId: string): Promise<Period[]> {
    return this.repository.findAllByAcademicYearId(academicYearId);
  }

  async findOne(id: string): Promise<Period> {
    const period = await this.repository.findById(id);
    if (!period) {
      throw new NotFoundException(`Period ${id} not found`);
    }
    return period;
  }

  async create(academicYearId: string, data: CreatePeriodDto): Promise<Period> {
    const academicYear = await this.academicYearRepository.findById(academicYearId);
    if (!academicYear) {
      throw new NotFoundException(`AcademicYear ${academicYearId} not found`);
    }

    let period: Period;
    try {
      period = await this.repository.create({ academicYearId, ...data });
    } catch (err) {
      rethrowAsHttpException(err);
    }

    await Promise.all(
      DEFAULT_EVALUATIONS.map((evaluation) =>
        this.evaluationRepository.create({ periodId: period.id, ...evaluation }),
      ),
    );

    return period;
  }

  async update(id: string, data: UpdatePeriodDto): Promise<Period> {
    await this.findOne(id);
    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new NotFoundException(`Period ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    try {
      await this.repository.remove(id);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }
}
