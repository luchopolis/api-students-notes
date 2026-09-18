import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IEvaluationRepository } from '../domain/repositories/evaluation.repository.js';
import { EVALUATION_REPOSITORY } from '../domain/repositories/evaluation.repository.js';
import { Evaluation } from '../domain/entities/evaluation.entity.js';
import { UpdateEvaluationDto } from '../application/dtos/update-evaluation.dto.js';

const WEIGHT_SUM_TOLERANCE = 0.01;

@Injectable()
export class EvaluationsService {
  constructor(
    @Inject(EVALUATION_REPOSITORY) private readonly repository: IEvaluationRepository,
  ) {}

  findAllByPeriodId(periodId: string): Promise<Evaluation[]> {
    return this.repository.findAllByPeriodId(periodId);
  }

  async findOne(id: string): Promise<Evaluation> {
    const evaluation = await this.repository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation ${id} not found`);
    }
    return evaluation;
  }

  async update(id: string, data: UpdateEvaluationDto): Promise<Evaluation> {
    const evaluation = await this.findOne(id);
    if (data.weight === undefined) {
      return evaluation;
    }

    const siblings = await this.repository.findAllByPeriodId(evaluation.periodId);
    const sum = siblings.reduce(
      (total, sibling) => total + (sibling.id === id ? data.weight! : sibling.weight),
      0,
    );
    if (Math.abs(sum - 100) > WEIGHT_SUM_TOLERANCE) {
      throw new BadRequestException(
        `The weights of NOTE_1 + NOTE_2 + EXAM for this period must add up to 100 (currently ${sum}).`,
      );
    }

    const updated = await this.repository.updateWeight(id, data.weight);
    if (!updated) {
      throw new NotFoundException(`Evaluation ${id} not found`);
    }
    return updated;
  }
}
