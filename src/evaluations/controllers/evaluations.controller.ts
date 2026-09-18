import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { EvaluationsService } from '../services/evaluations.service.js';
import { UpdateEvaluationDto } from '../application/dtos/update-evaluation.dto.js';

@Controller()
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get('periods/:periodId/evaluations')
  findAllByPeriod(@Param('periodId') periodId: string) {
    return this.evaluationsService.findAllByPeriodId(periodId);
  }

  @Get('evaluations/:id')
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Patch('evaluations/:id')
  update(@Param('id') id: string, @Body() data: UpdateEvaluationDto) {
    return this.evaluationsService.update(id, data);
  }
}
