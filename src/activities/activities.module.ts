import { Module } from '@nestjs/common';
import { ActivitiesController } from './controllers/activities.controller.js';
import { ActivitiesService } from './services/activities.service.js';
import { ACTIVITY_REPOSITORY } from './domain/repositories/activity.repository.js';
import { PrismaActivityRepository } from './infrastructure/persistence/prisma-activity.repository.js';
import { EvaluationsModule } from '../evaluations/evaluations.module.js';

@Module({
  imports: [EvaluationsModule],
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    {
      provide: ACTIVITY_REPOSITORY,
      useClass: PrismaActivityRepository,
    },
  ],
  exports: [ACTIVITY_REPOSITORY],
})
export class ActivitiesModule {}
