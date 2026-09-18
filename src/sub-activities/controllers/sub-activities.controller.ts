import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SubActivitiesService } from '../services/sub-activities.service.js';
import { CreateSubActivityDto } from '../application/dtos/create-sub-activity.dto.js';
import { UpdateSubActivityDto } from '../application/dtos/update-sub-activity.dto.js';

@Controller()
export class SubActivitiesController {
  constructor(private readonly subActivitiesService: SubActivitiesService) {}

  @Get('activities/:activityId/sub-activities')
  findAllByActivity(@Param('activityId') activityId: string) {
    return this.subActivitiesService.findAllByActivityId(activityId);
  }

  @Post('activities/:activityId/sub-activities')
  create(@Param('activityId') activityId: string, @Body() data: CreateSubActivityDto) {
    return this.subActivitiesService.create(activityId, data);
  }

  @Get('sub-activities/:id')
  findOne(@Param('id') id: string) {
    return this.subActivitiesService.findOne(id);
  }

  @Patch('sub-activities/:id')
  update(@Param('id') id: string, @Body() data: UpdateSubActivityDto) {
    return this.subActivitiesService.update(id, data);
  }

  @Delete('sub-activities/:id')
  remove(@Param('id') id: string) {
    return this.subActivitiesService.remove(id);
  }
}
