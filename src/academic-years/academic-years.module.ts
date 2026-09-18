import { Module } from '@nestjs/common';
import { AcademicYearsController } from './controllers/academic-years.controller.js';
import { AcademicYearsService } from './services/academic-years.service.js';
import { ACADEMIC_YEAR_REPOSITORY } from './domain/repositories/academic-year.repository.js';
import { PrismaAcademicYearRepository } from './infrastructure/persistence/prisma-academic-year.repository.js';
import { TeachersModule } from '../teachers/teachers.module.js';

@Module({
  imports: [TeachersModule],
  controllers: [AcademicYearsController],
  providers: [
    AcademicYearsService,
    {
      provide: ACADEMIC_YEAR_REPOSITORY,
      useClass: PrismaAcademicYearRepository,
    },
  ],
  exports: [ACADEMIC_YEAR_REPOSITORY],
})
export class AcademicYearsModule {}
