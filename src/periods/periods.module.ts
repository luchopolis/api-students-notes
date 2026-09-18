import { Module } from '@nestjs/common';
import { PeriodsController } from './controllers/periods.controller.js';
import { PeriodsService } from './services/periods.service.js';
import { PERIOD_REPOSITORY } from './domain/repositories/period.repository.js';
import { PrismaPeriodRepository } from './infrastructure/persistence/prisma-period.repository.js';
import { AcademicYearsModule } from '../academic-years/academic-years.module.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';

@Module({
  imports: [AcademicYearsModule, EvaluationsModule],
  controllers: [PeriodsController],
  providers: [
    PeriodsService,
    {
      provide: PERIOD_REPOSITORY,
      useClass: PrismaPeriodRepository,
    },
  ],
  exports: [PERIOD_REPOSITORY],
})
export class PeriodsModule {}
