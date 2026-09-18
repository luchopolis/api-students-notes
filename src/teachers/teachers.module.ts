import { Module } from '@nestjs/common';
import { TeachersController } from './controllers/teachers.controller.js';
import { TeachersService } from './services/teachers.service.js';
import { TEACHER_REPOSITORY } from './domain/repositories/teacher.repository.js';
import { PrismaTeacherRepository } from './infrastructure/persistence/prisma-teacher.repository.js';

@Module({
  controllers: [TeachersController],
  providers: [
    TeachersService,
    {
      provide: TEACHER_REPOSITORY,
      useClass: PrismaTeacherRepository,
    },
  ],
  exports: [TEACHER_REPOSITORY],
})
export class TeachersModule {}
