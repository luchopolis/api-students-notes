import { SubActivity } from '../entities/sub-activity.entity.js';
import { UpdateSubActivityDto } from '../../application/dtos/update-sub-activity.dto.js';

export const SUB_ACTIVITY_REPOSITORY = Symbol('SUB_ACTIVITY_REPOSITORY');

export type CreateSubActivityInput = {
  activityId: string;
  name: string;
  weight: number;
  description?: string;
};

export interface ISubActivityRepository {
  findAllByActivityId(activityId: string): Promise<SubActivity[]>;
  findById(id: string): Promise<SubActivity | null>;
  create(data: CreateSubActivityInput): Promise<SubActivity>;
  update(id: string, data: UpdateSubActivityDto): Promise<SubActivity | null>;
  remove(id: string): Promise<void>;
}
