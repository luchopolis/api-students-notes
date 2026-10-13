import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { ITeacherRepository, TeacherCredentials } from '../../domain/repositories/teacher.repository.js';
import { Teacher } from '../../domain/entities/teacher.entity.js';
import { CreateTeacherDto } from '../../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../../application/dtos/update-teacher.dto.js';

type TeacherRow = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
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

  async findCredentialsByEmail(email: string): Promise<TeacherCredentials | null> {
    const row = await db.orm.public.Teacher.where({ email }).first();
    return row ? { teacher: toEntity(row), passwordHash: row.passwordHash } : null;
  }

  async upsertWithPassword(data: { name: string; email: string; passwordHash: string }): Promise<Teacher> {
    const existing = await db.orm.public.Teacher.where({ email: data.email }).first();
    if (existing) {
      const row = await db.orm.public.Teacher.where({ id: existing.id }).update({
        name: data.name,
        passwordHash: data.passwordHash,
      });
      return toEntity(row ?? existing);
    }
    return toEntity(await db.orm.public.Teacher.create(data));
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
