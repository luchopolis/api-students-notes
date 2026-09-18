import { Module } from '@nestjs/common';
import { EnrollmentsController } from './controllers/enrollments.controller.js';
import { EnrollmentsService } from './services/enrollments.service.js';
import { ENROLLMENT_REPOSITORY } from './domain/repositories/enrollment.repository.js';
import { PrismaEnrollmentRepository } from './infrastructure/persistence/prisma-enrollment.repository.js';
import { StudentsModule } from '../students/students.module.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { AcademicYearsModule } from '../academic-years/academic-years.module.js';

@Module({
  imports: [StudentsModule, SubjectsModule, AcademicYearsModule],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: PrismaEnrollmentRepository,
    },
  ],
  exports: [ENROLLMENT_REPOSITORY],
})
export class EnrollmentsModule {}
