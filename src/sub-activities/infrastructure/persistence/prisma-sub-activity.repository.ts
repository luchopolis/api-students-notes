import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import {
  CreateSubActivityInput,
  ISubActivityRepository,
} from '../../domain/repositories/sub-activity.repository.js';
import { SubActivity } from '../../domain/entities/sub-activity.entity.js';
import { UpdateSubActivityDto } from '../../application/dtos/update-sub-activity.dto.js';

type SubActivityRow = {
  id: string;
  activityId: string;
  name: string;
  weight: number;
  description: string | null;
};

function toEntity(row: SubActivityRow): SubActivity {
  return new SubActivity(row);
}

@Injectable()
export class PrismaSubActivityRepository implements ISubActivityRepository {
  async findAllByActivityId(activityId: string): Promise<SubActivity[]> {
    const rows = await db.orm.public.SubActivity.where({ activityId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<SubActivity | null> {
    const row = await db.orm.public.SubActivity.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateSubActivityInput): Promise<SubActivity> {
    const row = await db.orm.public.SubActivity.create({
      activityId: data.activityId,
      name: data.name,
      weight: data.weight,
      description: data.description ?? null,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateSubActivityDto): Promise<SubActivity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.SubActivity.where({ id }).update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.description !== undefined && { description: data.description }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.SubActivity.where({ id }).delete();
  }
}
