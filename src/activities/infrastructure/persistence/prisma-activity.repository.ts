import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { CreateActivityInput, IActivityRepository } from '../../domain/repositories/activity.repository.js';
import { Activity } from '../../domain/entities/activity.entity.js';
import { UpdateActivityDto } from '../../application/dtos/update-activity.dto.js';

type ActivityRow = {
  id: string;
  evaluationId: string;
  name: string;
  weight: number;
  description: string | null;
};

function toEntity(row: ActivityRow): Activity {
  return new Activity(row);
}

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
  async findAllByEvaluationId(evaluationId: string): Promise<Activity[]> {
    const rows = await db.orm.public.Activity.where({ evaluationId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Activity | null> {
    const row = await db.orm.public.Activity.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateActivityInput): Promise<Activity> {
    const row = await db.orm.public.Activity.create({
      evaluationId: data.evaluationId,
      name: data.name,
      weight: data.weight,
      description: data.description ?? null,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateActivityDto): Promise<Activity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Activity.where({ id }).update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.description !== undefined && { description: data.description }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Activity.where({ id }).delete();
  }
}
