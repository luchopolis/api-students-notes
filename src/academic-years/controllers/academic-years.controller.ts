import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AcademicYearsService } from '../services/academic-years.service.js';
import { CreateAcademicYearDto } from '../application/dtos/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../application/dtos/update-academic-year.dto.js';

@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  findAll() {
    return this.academicYearsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateAcademicYearDto) {
    return this.academicYearsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAcademicYearDto) {
    return this.academicYearsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicYearsService.remove(id);
  }
}
