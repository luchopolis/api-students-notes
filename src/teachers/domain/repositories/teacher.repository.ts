import { Teacher } from '../entities/teacher.entity.js';
import { CreateTeacherDto } from '../../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../../application/dtos/update-teacher.dto.js';

export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface ITeacherRepository {
  findAll(): Promise<Teacher[]>;
  findById(id: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
  create(data: CreateTeacherDto): Promise<Teacher>;
  update(id: string, data: UpdateTeacherDto): Promise<Teacher | null>;
  remove(id: string): Promise<void>;
}
