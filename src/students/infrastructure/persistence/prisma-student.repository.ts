import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { IStudentRepository } from '../../domain/repositories/student.repository.js';
import { Student } from '../../domain/entities/student.entity.js';
import { CreateStudentDto } from '../../application/dtos/create-student.dto.js';
import { UpdateStudentDto } from '../../application/dtos/update-student.dto.js';

type StudentRow = {
  id: string;
  dni: string;
  firstName: string;
  lastName1: string;
  lastName2: string | null;
  birthDate: string;
  email: string;
};

function toEntity(row: StudentRow): Student {
  return new Student(row);
}

@Injectable()
export class PrismaStudentRepository implements IStudentRepository {
  async findAll(): Promise<Student[]> {
    const rows = await db.orm.public.Student.all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Student | null> {
    const row = await db.orm.public.Student.first({ id });
    return row ? toEntity(row) : null;
  }

  async findByDni(dni: string): Promise<Student | null> {
    const row = await db.orm.public.Student.where({ dni }).first();
    return row ? toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const row = await db.orm.public.Student.where({ email }).first();
    return row ? toEntity(row) : null;
  }

  async create(data: CreateStudentDto): Promise<Student> {
    const row = await db.orm.public.Student.create({
      dni: data.dni,
      firstName: data.firstName,
      lastName1: data.lastName1,
      lastName2: data.lastName2 ?? null,
      birthDate: data.birthDate,
      email: data.email,
    });
    return toEntity(row);
  }

  async update(id: string, data: UpdateStudentDto): Promise<Student | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const row = await db.orm.public.Student.where({ id }).update({
      ...(data.dni !== undefined && { dni: data.dni }),
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName1 !== undefined && { lastName1: data.lastName1 }),
      ...(data.lastName2 !== undefined && { lastName2: data.lastName2 }),
      ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
      ...(data.email !== undefined && { email: data.email }),
    });
    return row ? toEntity(row) : null;
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Student.where({ id }).delete();
  }
}
