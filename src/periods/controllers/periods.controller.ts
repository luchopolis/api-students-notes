import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PeriodsService } from '../services/periods.service.js';
import { CreatePeriodDto } from '../application/dtos/create-period.dto.js';
import { UpdatePeriodDto } from '../application/dtos/update-period.dto.js';

@Controller()
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get('academic-years/:academicYearId/periods')
  findAllByAcademicYear(@Param('academicYearId') academicYearId: string) {
    return this.periodsService.findAllByAcademicYearId(academicYearId);
  }

  @Post('academic-years/:academicYearId/periods')
  create(@Param('academicYearId') academicYearId: string, @Body() data: CreatePeriodDto) {
    return this.periodsService.create(academicYearId, data);
  }

  @Get('periods/:id')
  findOne(@Param('id') id: string) {
    return this.periodsService.findOne(id);
  }

  @Patch('periods/:id')
  update(@Param('id') id: string, @Body() data: UpdatePeriodDto) {
    return this.periodsService.update(id, data);
  }

  @Delete('periods/:id')
  remove(@Param('id') id: string) {
    return this.periodsService.remove(id);
  }
}
