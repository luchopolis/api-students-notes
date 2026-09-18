import { Injectable } from '@nestjs/common';
import { db } from '../../../../prisma/db.js';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment.repository.js';
import { Enrollment } from '../../domain/entities/enrollment.entity.js';
import { CreateEnrollmentDto } from '../../application/dtos/create-enrollment.dto.js';

type EnrollmentRow = {
  id: string;
  studentId: string;
  subjectId: string;
  academicYearId: string;
  registrationDate: string;
};

function toEntity(row: EnrollmentRow): Enrollment {
  return new Enrollment(row);
}

@Injectable()
export class PrismaEnrollmentRepository implements IEnrollmentRepository {
  async findAll(): Promise<Enrollment[]> {
    const rows = await db.orm.public.Enrollment.all();
    return rows.map(toEntity);
  }

  async findAllBySubjectAndAcademicYear(subjectId: string, academicYearId: string): Promise<Enrollment[]> {
    const rows = await db.orm.public.Enrollment.where({ subjectId, academicYearId }).all();
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Enrollment | null> {
    const row = await db.orm.public.Enrollment.first({ id });
    return row ? toEntity(row) : null;
  }

  async create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const row = await db.orm.public.Enrollment.create({
      studentId: data.studentId,
      subjectId: data.subjectId,
      academicYearId: data.academicYearId,
      registrationDate: data.registrationDate,
    });
    return toEntity(row);
  }

  async remove(id: string): Promise<void> {
    await db.orm.public.Enrollment.where({ id }).delete();
  }
}
