import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { IGradeRepository } from '../../domain/repositories/grade.repository.js';
import { Grade, GradeStatus } from '../../domain/entities/grade.entity.js';
import { CreateGradeDto } from '../../application/dtos/create-grade.dto.js';
import { UpdateGradeDto } from '../../application/dtos/update-grade.dto.js';

type GradeRow = {
  id: string;
  enrollmentId: string;
  activityId: string | null;
  subActivityId: string | null;
  gradeValue: string;
  submissionDate: string | null;
  status: GradeStatus;
};

// `gradeValue` is stored as Postgres `numeric(5,2)`, which the ORM types as a
// branded string to avoid float rounding. Convert at the persistence boundary
// so the rest of the app deals in plain numbers.
function toNumericInput(value: number): any {
  return value.toFixed(2);
}

function toEntity(row: GradeRow): Grade {
  return new Grade({ ...row, gradeValue: Number(row.gradeValue) });
}

@Injectable()
export class PrismaGradeRepository implements IGradeRepository {
  async findAllByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    const rows = await db.orm.public.Grade.where({ enrollmentId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Grade | null> {
    const row = await db.orm.public.Grade.first({ id });
    return row ? toEntity(row) : null;
  }

  async findByEnrollmentAndActivity(enrollmentId: string, activityId: string): Promise<Grade | null> {
    const row = await db.orm.public.Grade.where({ enrollmentId, activityId }).first();
    return row ? toEntity(row) : null;
  }

  async create(data: CreateGradeDto): Promise<Grade> {
    const row = await db.orm.public.Grade.create({
      enrollmentId: data.enrollmentId,
      activityId: data.activityId ?? null,
      subActivityId: data.subActivityId ?? null,
      gradeValue: toNumericInput(data.gradeValue),
      submissionDate: data.submissionDate ?? null,
      status: data.status ?? 'PENDING',
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateGradeDto): Promise<Grade | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Grade.where({ id }).update({
      ...(data.gradeValue !== undefined && { gradeValue: toNumericInput(data.gradeValue) }),
      ...(data.submissionDate !== undefined && { submissionDate: data.submissionDate }),
      ...(data.status !== undefined && { status: data.status }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Grade.where({ id }).delete();
  }
}
