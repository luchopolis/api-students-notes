import { Module } from '@nestjs/common';
import { SubjectsController } from './controllers/subjects.controller.js';
import { SubjectsService } from './services/subjects.service.js';
import { SUBJECT_REPOSITORY } from './domain/repositories/subject.repository.js';
import { PrismaSubjectRepository } from './infrastructure/persistence/prisma-subject.repository.js';

@Module({
  controllers: [SubjectsController],
  providers: [
    SubjectsService,
    {
      provide: SUBJECT_REPOSITORY,
      useClass: PrismaSubjectRepository,
    },
  ],
  exports: [SUBJECT_REPOSITORY],
})
export class SubjectsModule {}
