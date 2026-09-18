import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IAcademicYearRepository } from '../domain/repositories/academic-year.repository.js';
import { ACADEMIC_YEAR_REPOSITORY } from '../domain/repositories/academic-year.repository.js';
import { AcademicYear } from '../domain/entities/academic-year.entity.js';
import { CreateAcademicYearDto } from '../application/dtos/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../application/dtos/update-academic-year.dto.js';
import { TEACHER_REPOSITORY } from '../../teachers/domain/repositories/teacher.repository.js';
import type { ITeacherRepository } from '../../teachers/domain/repositories/teacher.repository.js';
import { rethrowAsHttpException } from '../../shared/prisma-error.util.js';

@Injectable()
export class AcademicYearsService {
  constructor(
    @Inject(ACADEMIC_YEAR_REPOSITORY) private readonly repository: IAcademicYearRepository,
    @Inject(TEACHER_REPOSITORY) private readonly teacherRepository: ITeacherRepository,
  ) {}

  findAll(): Promise<AcademicYear[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<AcademicYear> {
    const academicYear = await this.repository.findById(id);
    if (!academicYear) {
      throw new NotFoundException(`AcademicYear ${id} not found`);
    }
    return academicYear;
  }

  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    await this.teacherRepository.findById(data.teacherId).then((teacher) => {
      if (!teacher) {
        throw new NotFoundException(`Teacher ${data.teacherId} not found`);
      }
    });
    try {
      return await this.repository.create(data);
    } catch (err) {
      rethrowAsHttpException(err);
    }
  }

  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear> {
    await this.findOne(id);
    try {
      const updated = await this.repository.update(id, data);
      if (!updated) {
        throw new NotFoundException(`AcademicYear ${id} not found`);
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
