import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IActivityRepository } from '../domain/repositories/activity.repository.js';
import { ACTIVITY_REPOSITORY } from '../domain/repositories/activity.repository.js';
import { Activity } from '../domain/entities/activity.entity.js';
import { CreateActivityDto } from '../application/dtos/create-activity.dto.js';
import { UpdateActivityDto } from '../application/dtos/update-activity.dto.js';
import { EVALUATION_REPOSITORY } from '../../evaluations/domain/repositories/evaluation.repository.js';
import type { IEvaluationRepository } from '../../evaluations/domain/repositories/evaluation.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY) private readonly repository: IActivityRepository,
    @Inject(EVALUATION_REPOSITORY) private readonly evaluationRepository: IEvaluationRepository,
  ) {}

  findAllByEvaluationId(evaluationId: string): Promise<Activity[]> {
    return this.repository.findAllByEvaluationId(evaluationId);
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.repository.findById(id);
    if (!activity) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    return activity;
  }

  async create(evaluationId: string, data: CreateActivityDto): Promise<Activity> {
    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation ${evaluationId} not found`);
    }
    try {
      return await this.repository.create({ evaluationId, ...data });
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateActivityDto): Promise<Activity> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`Activity ${id} not found`);
      }
      return updated;
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
