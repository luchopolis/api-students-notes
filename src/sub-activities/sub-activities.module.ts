import { Module } from '@nestjs/common';
import { SubActivitiesController } from './controllers/sub-activities.controller.js';
import { SubActivitiesService } from './services/sub-activities.service.js';
import { SUB_ACTIVITY_REPOSITORY } from './domain/repositories/sub-activity.repository.js';
import { PrismaSubActivityRepository } from './infrastructure/persistence/prisma-sub-activity.repository.js';
import { ActivitiesModule } from '../activities/activities.module.js';

@Module({
  imports: [ActivitiesModule],
  controllers: [SubActivitiesController],
  providers: [
    SubActivitiesService,
    {
      provide: SUB_ACTIVITY_REPOSITORY,
      useClass: PrismaSubActivityRepository,
    },
  ],
  exports: [SUB_ACTIVITY_REPOSITORY],
})
export class SubActivitiesModule {}
