import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { ITeacherRepository } from '../../domain/repositories/teacher.repository.js';
import { Teacher } from '../../domain/entities/teacher.entity.js';
import { CreateTeacherDto } from '../../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../../application/dtos/update-teacher.dto.js';

type TeacherRow = {
  id: string;
  name: string;
  email: string;
};

function toEntity(row: TeacherRow): Teacher {
  return new Teacher(row);
}

@Injectable()
export class PrismaTeacherRepository implements ITeacherRepository {
  async findAll(): Promise<Teacher[]> {
    const rows = await db.orm.public.Teacher.all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Teacher | null> {
    const row = await db.orm.public.Teacher.first({ id });
    return row ? toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    const row = await db.orm.public.Teacher.where({ email }).first();
    return row ? toEntity(row) : null;
  }

  async create(data: CreateTeacherDto): Promise<Teacher> {
    const row = await db.orm.public.Teacher.create({
      name: data.name,
      email: data.email,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateTeacherDto): Promise<Teacher | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Teacher.where({ id }).update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Teacher.where({ id }).delete();
  }
}
