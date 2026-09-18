import { Student } from '../entities/student.entity.js';
import { CreateStudentDto } from '../../application/dtos/create-student.dto.js';
import { UpdateStudentDto } from '../../application/dtos/update-student.dto.js';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface IStudentRepository {
  findAll(): Promise<Student[]>;
  findById(id: string): Promise<Student | null>;
  findByDni(dni: string): Promise<Student | null>;
  findByEmail(email: string): Promise<Student | null>;
  create(data: CreateStudentDto): Promise<Student>;
  update(id: string, data: UpdateStudentDto): Promise<Student | null>;
  remove(id: string): Promise<void>;
}
