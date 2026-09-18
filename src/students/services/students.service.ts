import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IStudentRepository } from '../domain/repositories/student.repository.js';
import { STUDENT_REPOSITORY } from '../domain/repositories/student.repository.js';
import { Student } from '../domain/entities/student.entity.js';
import { CreateStudentDto } from '../application/dtos/create-student.dto.js';
import { UpdateStudentDto } from '../application/dtos/update-student.dto.js';

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

  create(data: CreateStudentDto): Promise<Student> {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateStudentDto): Promise<Student> {
    const updated = await this.repository.update(id, data);
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
