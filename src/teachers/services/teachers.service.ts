import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITeacherRepository } from '../domain/repositories/teacher.repository.js';
import { TEACHER_REPOSITORY } from '../domain/repositories/teacher.repository.js';
import { Teacher } from '../domain/entities/teacher.entity.js';
import { CreateTeacherDto } from '../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../application/dtos/update-teacher.dto.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class TeachersService {
  constructor(
    @Inject(TEACHER_REPOSITORY) private readonly repository: ITeacherRepository,
  ) {}

  findAll(): Promise<Teacher[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Teacher> {
    const teacher = await this.repository.findById(id);
    if (!teacher) {
      throw new NotFoundException(`Teacher ${id} not found`);
    }
    return teacher;
  }

  async create(data: CreateTeacherDto): Promise<Teacher> {
    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateTeacherDto): Promise<Teacher> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`Teacher ${id} not found`);
      }
      return updated;
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repository.remove(id);
  }
}
