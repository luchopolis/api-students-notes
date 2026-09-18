import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EnrollmentsService } from '../services/enrollments.service.js';
import { CreateEnrollmentDto } from '../application/dtos/create-enrollment.dto.js';
import { FindEnrollmentsQueryDto } from '../application/dtos/find-enrollments-query.dto.js';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  findAll(@Query() query: FindEnrollmentsQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateEnrollmentDto) {
    return this.enrollmentsService.create(data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
