import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { CreatePeriodInput, IPeriodRepository } from '../../domain/repositories/period.repository.js';
import { Period } from '../../domain/entities/period.entity.js';
import { UpdatePeriodDto } from '../../application/dtos/update-period.dto.js';

type PeriodRow = {
  id: string;
  academicYearId: string;
  number: number;
  name: string;
};

function toEntity(row: PeriodRow): Period {
  return new Period(row);
}

@Injectable()
export class PrismaPeriodRepository implements IPeriodRepository {
  async findAllByAcademicYearId(academicYearId: string): Promise<Period[]> {
    const rows = await db.orm.public.Period.where({ academicYearId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Period | null> {
    const row = await db.orm.public.Period.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreatePeriodInput): Promise<Period> {
    const row = await db.orm.public.Period.create({
      academicYearId: data.academicYearId,
      number: data.number,
      name: data.name,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdatePeriodDto): Promise<Period | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Period.where({ id }).update({
      ...(data.name !== undefined && { name: data.name }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Period.where({ id }).delete();
  }
}
