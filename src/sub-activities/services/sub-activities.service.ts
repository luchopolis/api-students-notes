import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISubActivityRepository } from '../domain/repositories/sub-activity.repository.js';
import { SUB_ACTIVITY_REPOSITORY } from '../domain/repositories/sub-activity.repository.js';
import { SubActivity } from '../domain/entities/sub-activity.entity.js';
import { CreateSubActivityDto } from '../application/dtos/create-sub-activity.dto.js';
import { UpdateSubActivityDto } from '../application/dtos/update-sub-activity.dto.js';
import { ACTIVITY_REPOSITORY } from '../../activities/domain/repositories/activity.repository.js';
import type { IActivityRepository } from '../../activities/domain/repositories/activity.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class SubActivitiesService {
  constructor(
    @Inject(SUB_ACTIVITY_REPOSITORY) private readonly repository: ISubActivityRepository,
    @Inject(ACTIVITY_REPOSITORY) private readonly activityRepository: IActivityRepository,
  ) {}

  findAllByActivityId(activityId: string): Promise<SubActivity[]> {
    return this.repository.findAllByActivityId(activityId);
  }

  async findOne(id: string): Promise<SubActivity> {
    const subActivity = await this.repository.findById(id);
    if (!subActivity) {
      throw new NotFoundException(`SubActivity ${id} not found`);
    }
    return subActivity;
  }

  async create(activityId: string, data: CreateSubActivityDto): Promise<SubActivity> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }
    try {
      return await this.repository.create({ activityId, ...data });
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateSubActivityDto): Promise<SubActivity> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`SubActivity ${id} not found`);
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
