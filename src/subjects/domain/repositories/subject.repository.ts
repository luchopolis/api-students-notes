import { Subject } from '../entities/subject.entity.js';
import { CreateSubjectDto } from '../../application/dtos/create-subject.dto.js';
import { UpdateSubjectDto } from '../../application/dtos/update-subject.dto.js';

export const SUBJECT_REPOSITORY = Symbol('SUBJECT_REPOSITORY');

export interface ISubjectRepository {
  findAll(): Promise<Subject[]>;
  findById(id: string): Promise<Subject | null>;
  create(data: CreateSubjectDto): Promise<Subject>;
  update(id: string, data: UpdateSubjectDto): Promise<Subject | null>;
  remove(id: string): Promise<void>;
}
