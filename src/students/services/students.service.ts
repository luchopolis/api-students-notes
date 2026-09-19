import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IStudentRepository } from '../domain/repositories/student.repository.js';
import { STUDENT_REPOSITORY } from '../domain/repositories/student.repository.js';
import { Student } from '../domain/entities/student.entity.js';
import { CreateStudentDto } from '../application/dtos/create-student.dto.js';
import { UpdateStudentDto } from '../application/dtos/update-student.dto.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class StudentsService {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly repository: IStudentRepository,
  ) {}

  findAll(): Promise<Student[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.repository.findById(id);
    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return student;
  }

  async create(data: CreateStudentDto): Promise<Student> {
    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    let updated: Student | null;
    try {
      updated = await this.repository.update(id, data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
    if (!updated) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
