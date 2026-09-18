import { Injectable } from '@nestjs/common';
import type { TimestamptzString } from '@prisma/orm-postgres/target/codec-types';
import { db } from '../../../../prisma/db.js';
import {
  CreatePeriodFileInput,
  FindPeriodFilesFilter,
  IPeriodFileRepository,
} from '../../domain/repositories/period-file.repository.js';
import { PeriodFile } from '../../domain/entities/period-file.entity.js';

type PeriodFileRow = {
  id: string;
  periodId: string;
  subjectId: string;
  fileName: string;
  storageKey: string;
  generatedAt: string;
};

function toEntity(row: PeriodFileRow): PeriodFile {
  return new PeriodFile(row);
}

@Injectable()
export class PrismaPeriodFileRepository implements IPeriodFileRepository {
  async findAll({ periodId, subjectId }: FindPeriodFilesFilter): Promise<PeriodFile[]> {
    const rows = await db.orm.public.PeriodFile.where({
      ...(periodId && { periodId }),
      ...(subjectId && { subjectId }),
    })
      .orderBy((file) => file.generatedAt.desc())
      .all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<PeriodFile | null> {
    const row = await db.orm.public.PeriodFile.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreatePeriodFileInput): Promise<PeriodFile> {
    const row = await db.orm.public.PeriodFile.create({
      id: data.id,
      periodId: data.periodId,
      subjectId: data.subjectId,
      fileName: data.fileName,
      storageKey: data.storageKey,
      generatedAt: data.generatedAt as TimestamptzString<3>,
    });
    return toEntity(row);
  }
}
