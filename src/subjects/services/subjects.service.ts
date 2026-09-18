import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/repositories/subject.repository.js';
import { SUBJECT_REPOSITORY } from '../domain/repositories/subject.repository.js';
import { Subject } from '../domain/entities/subject.entity.js';
import { CreateSubjectDto } from '../application/dtos/create-subject.dto.js';
import { UpdateSubjectDto } from '../application/dtos/update-subject.dto.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class SubjectsService {
  constructor(
    @Inject(SUBJECT_REPOSITORY) private readonly repository: ISubjectRepository,
  ) {}

  findAll(): Promise<Subject[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundException(`Subject ${id} not found`);
    }
    return subject;
  }

  async create(data: CreateSubjectDto): Promise<Subject> {
    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateSubjectDto): Promise<Subject> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`Subject ${id} not found`);
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
