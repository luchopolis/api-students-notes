import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { ISubjectRepository } from '../../domain/repositories/subject.repository.js';
import { Subject } from '../../domain/entities/subject.entity.js';
import { CreateSubjectDto } from '../../application/dtos/create-subject.dto.js';
import { UpdateSubjectDto } from '../../application/dtos/update-subject.dto.js';

type SubjectRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

function toEntity(row: SubjectRow): Subject {
  return new Subject(row);
}

@Injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  async findAll(): Promise<Subject[]> {
    const rows = await db.orm.public.Subject.all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Subject | null> {
    const row = await db.orm.public.Subject.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateSubjectDto): Promise<Subject> {
    const row = await db.orm.public.Subject.create({
      code: data.code,
      name: data.name,
      description: data.description ?? null,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateSubjectDto): Promise<Subject | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Subject.where({ id }).update({
      ...(data.code !== undefined && { code: data.code }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Subject.where({ id }).delete();
  }
}
