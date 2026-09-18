import { Module } from '@nestjs/common';
import { GradesController } from './controllers/grades.controller.js';
import { GradeCalculationsController } from './controllers/grade-calculations.controller.js';
import { GradesService } from './services/grades.service.js';
import { GradeCalculationService } from './services/grade-calculation.service.js';
import { GRADE_REPOSITORY } from './domain/repositories/grade.repository.js';
import { PrismaGradeRepository } from './infrastructure/persistence/prisma-grade.repository.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { ActivitiesModule } from '../activities/activities.module.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';
import { PeriodsModule } from '../periods/periods.module.js';
import { SubActivitiesModule } from '../sub-activities/sub-activities.module.js';

@Module({
  imports: [EnrollmentsModule, ActivitiesModule, EvaluationsModule, PeriodsModule, SubActivitiesModule],
  controllers: [GradesController, GradeCalculationsController],
  providers: [
    GradesService,
    GradeCalculationService,
    {
      provide: GRADE_REPOSITORY,
      useClass: PrismaGradeRepository,
    },
  ],
  exports: [GRADE_REPOSITORY],
})
export class GradesModule {}
