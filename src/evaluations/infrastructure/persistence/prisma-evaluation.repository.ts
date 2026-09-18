import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import {
  CreateEvaluationInput,
  IEvaluationRepository,
} from '../../domain/repositories/evaluation.repository.js';
import { Evaluation, EvaluationType } from '../../domain/entities/evaluation.entity.js';

type EvaluationRow = {
  id: string;
  periodId: string;
  type: EvaluationType;
  weight: number;
  activityOrder: number;
};

function toEntity(row: EvaluationRow): Evaluation {
  return new Evaluation(row);
}

@Injectable()
export class PrismaEvaluationRepository implements IEvaluationRepository {
  async findAllByPeriodId(periodId: string): Promise<Evaluation[]> {
    const rows = await db.orm.public.Evaluation.where({ periodId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Evaluation | null> {
    const row = await db.orm.public.Evaluation.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateEvaluationInput): Promise<Evaluation> {
    const row = await db.orm.public.Evaluation.create({
      periodId: data.periodId,
      type: data.type,
      weight: data.weight,
      activityOrder: data.activityOrder,
    });
    return toEntity(row);
  }

  async updateWeight(id: string, weight: number): Promise<Evaluation | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Evaluation.where({ id }).update({ weight });
    return row ? toEntity(row) : null;
  }
}
