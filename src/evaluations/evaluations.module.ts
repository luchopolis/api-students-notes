import { Module } from '@nestjs/common';
import { EvaluationsController } from './controllers/evaluations.controller.js';
import { EvaluationsService } from './services/evaluations.service.js';
import { EVALUATION_REPOSITORY } from './domain/repositories/evaluation.repository.js';
import { PrismaEvaluationRepository } from './infrastructure/persistence/prisma-evaluation.repository.js';

@Module({
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    {
      provide: EVALUATION_REPOSITORY,
      useClass: PrismaEvaluationRepository,
    },
  ],
  exports: [EVALUATION_REPOSITORY],
})
export class EvaluationsModule {}
