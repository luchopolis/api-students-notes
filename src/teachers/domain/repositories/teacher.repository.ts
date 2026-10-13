import { Teacher } from '../entities/teacher.entity.js';
import { CreateTeacherDto } from '../../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../../application/dtos/update-teacher.dto.js';

/** Teacher junto con su hash: solo lo usan auth y el seed, nunca sale por la API de /teachers. */
export type TeacherCredentials = { teacher: Teacher; passwordHash: string | null };

export const TEACHER_REPOSITORY = Symbol('TEACHER_REPOSITORY');

export interface ITeacherRepository {
  findAll(): Promise<Teacher[]>;
  findById(id: string): Promise<Teacher | null>;
  findByEmail(email: string): Promise<Teacher | null>;
  findCredentialsByEmail(email: string): Promise<TeacherCredentials | null>;
  /** Crea la profesora o, si ya existe ese email, actualiza nombre y contraseña. */
  upsertWithPassword(data: { name: string; email: string; passwordHash: string }): Promise<Teacher>;
  create(data: CreateTeacherDto): Promise<Teacher>;
  update(id: string, data: UpdateTeacherDto): Promise<Teacher | null>;
  remove(id: string): Promise<void>;
}
