import { Module } from '@nestjs/common';
import { StudentsController } from './controllers/students.controller.js';
import { StudentsService } from './services/students.service.js';
import { STUDENT_REPOSITORY } from './domain/repositories/student.repository.js';
import { PrismaStudentRepository } from './infrastructure/persistence/prisma-student.repository.js';
import { ExcelModule } from '../shared/excel/excel.module.js';

@Module({
  imports: [ExcelModule],
  controllers: [StudentsController],
  providers: [
    StudentsService,
    {
      provide: STUDENT_REPOSITORY,
      useClass: PrismaStudentRepository,
    },
  ],
  exports: [STUDENT_REPOSITORY],
})
export class StudentsModule {}
