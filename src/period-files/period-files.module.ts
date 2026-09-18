import { Module } from '@nestjs/common';
import { PeriodFilesController } from './controllers/period-files.controller.js';
import { PeriodFilesService } from './services/period-files.service.js';
import { PERIOD_FILE_REPOSITORY } from './domain/repositories/period-file.repository.js';
import { PrismaPeriodFileRepository } from './infrastructure/persistence/prisma-period-file.repository.js';
import { AcademicYearsModule } from '../academic-years/academic-years.module.js';
import { PeriodsModule } from '../periods/periods.module.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { StudentsModule } from '../students/students.module.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';
import { GradesModule } from '../grades/grades.module.js';
import { ExcelModule } from '../shared/excel/excel.module.js';

@Module({
  imports: [
    AcademicYearsModule,
    PeriodsModule,
    SubjectsModule,
    EnrollmentsModule,
    StudentsModule,
    EvaluationsModule,
    GradesModule,
    ExcelModule,
  ],
  controllers: [PeriodFilesController],
  providers: [
    PeriodFilesService,
    {
      provide: PERIOD_FILE_REPOSITORY,
      useClass: PrismaPeriodFileRepository,
    },
  ],
})
export class PeriodFilesModule {}
