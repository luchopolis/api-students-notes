import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IGradeRepository } from '../domain/repositories/grade.repository.js';
import { GRADE_REPOSITORY } from '../domain/repositories/grade.repository.js';
import { Grade } from '../domain/entities/grade.entity.js';
import { CreateGradeDto } from '../application/dtos/create-grade.dto.js';
import { UpdateGradeDto } from '../application/dtos/update-grade.dto.js';
import { ENROLLMENT_REPOSITORY } from '../../enrollments/domain/repositories/enrollment.repository.js';
import type { IEnrollmentRepository } from '../../enrollments/domain/repositories/enrollment.repository.js';
import { ACTIVITY_REPOSITORY } from '../../activities/domain/repositories/activity.repository.js';
import type { IActivityRepository } from '../../activities/domain/repositories/activity.repository.js';
import { SUB_ACTIVITY_REPOSITORY } from '../../sub-activities/domain/repositories/sub-activity.repository.js';
import type { ISubActivityRepository } from '../../sub-activities/domain/repositories/sub-activity.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class GradesService {
  constructor(
    @Inject(GRADE_REPOSITORY) private readonly repository: IGradeRepository,
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: IEnrollmentRepository,
    @Inject(ACTIVITY_REPOSITORY) private readonly activityRepository: IActivityRepository,
    @Inject(SUB_ACTIVITY_REPOSITORY) private readonly subActivityRepository: ISubActivityRepository,
  ) {}

  findAllByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    return this.repository.findAllByEnrollmentId(enrollmentId);
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.repository.findById(id);
    if (!grade) {
      throw new NotFoundException(`Grade ${id} not found`);
    }
    return grade;
  }

  async create(data: CreateGradeDto): Promise<Grade> {
    if (!data.activityId === !data.subActivityId) {
      throw new BadRequestException(
        'Exactly one of activityId or subActivityId must be provided.',
      );
    }

    const [enrollment, target] = await Promise.all([
      this.enrollmentRepository.findById(data.enrollmentId),
      data.activityId
        ? this.activityRepository.findById(data.activityId)
        : this.subActivityRepository.findById(data.subActivityId!),
    ]);
    if (!enrollment) throw new NotFoundException(`Enrollment ${data.enrollmentId} not found`);
    if (!target) {
      throw new NotFoundException(
        data.activityId
          ? `Activity ${data.activityId} not found`
          : `SubActivity ${data.subActivityId} not found`,
      );
    }

    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateGradeDto): Promise<Grade> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`Grade ${id} not found`);
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
