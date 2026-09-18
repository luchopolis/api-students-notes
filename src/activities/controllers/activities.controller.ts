import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ActivitiesService } from '../services/activities.service.js';
import { CreateActivityDto } from '../application/dtos/create-activity.dto.js';
import { UpdateActivityDto } from '../application/dtos/update-activity.dto.js';

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('evaluations/:evaluationId/activities')
  findAllByEvaluation(@Param('evaluationId') evaluationId: string) {
    return this.activitiesService.findAllByEvaluationId(evaluationId);
  }

  @Post('evaluations/:evaluationId/activities')
  create(@Param('evaluationId') evaluationId: string, @Body() data: CreateActivityDto) {
    return this.activitiesService.create(evaluationId, data);
  }

  @Get('activities/:id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch('activities/:id')
  update(@Param('id') id: string, @Body() data: UpdateActivityDto) {
    return this.activitiesService.update(id, data);
  }

  @Delete('activities/:id')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
