import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GradesService } from '../services/grades.service.js';
import { CreateGradeDto } from '../application/dtos/create-grade.dto.js';
import { UpdateGradeDto } from '../application/dtos/update-grade.dto.js';

@Controller()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('enrollments/:enrollmentId/grades')
  findAllByEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.gradesService.findAllByEnrollmentId(enrollmentId);
  }

  @Post('grades')
  create(@Body() data: CreateGradeDto) {
    return this.gradesService.create(data);
  }

  @Get('grades/:id')
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(id);
  }

  @Patch('grades/:id')
  update(@Param('id') id: string, @Body() data: UpdateGradeDto) {
    return this.gradesService.update(id, data);
  }

  @Delete('grades/:id')
  remove(@Param('id') id: string) {
    return this.gradesService.remove(id);
  }
}
