import { Activity } from '../entities/activity.entity.js';
import { UpdateActivityDto } from '../../application/dtos/update-activity.dto.js';

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');

export type CreateActivityInput = {
  evaluationId: string;
  name: string;
  weight: number;
  description?: string;
};

export interface IActivityRepository {
  findAllByEvaluationId(evaluationId: string): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  create(data: CreateActivityInput): Promise<Activity>;
  update(id: string, data: UpdateActivityDto): Promise<Activity | null>;
  remove(id: string): Promise<void>;
}
