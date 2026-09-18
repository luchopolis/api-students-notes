import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { IAcademicYearRepository } from '../../domain/repositories/academic-year.repository.js';
import { AcademicYear } from '../../domain/entities/academic-year.entity.js';
import { CreateAcademicYearDto } from '../../application/dtos/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../../application/dtos/update-academic-year.dto.js';

type AcademicYearRow = {
  id: string;
  yearName: string;
  startDate: string;
  endDate: string;
  teacherId: string;
};

function toEntity(row: AcademicYearRow): AcademicYear {
  return new AcademicYear(row);
}

@Injectable()
export class PrismaAcademicYearRepository implements IAcademicYearRepository {
  async findAll(): Promise<AcademicYear[]> {
    const rows = await db.orm.public.AcademicYear.all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<AcademicYear | null> {
    const row = await db.orm.public.AcademicYear.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    const row = await db.orm.public.AcademicYear.create({
      yearName: data.yearName,
      startDate: data.startDate,
      endDate: data.endDate,
      teacherId: data.teacherId,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.AcademicYear.where({ id }).update({
      ...(data.yearName !== undefined && { yearName: data.yearName }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.AcademicYear.where({ id }).delete();
  }
}
