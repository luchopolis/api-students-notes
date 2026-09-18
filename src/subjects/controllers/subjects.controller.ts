import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SubjectsService } from '../services/subjects.service.js';
import { CreateSubjectDto } from '../application/dtos/create-subject.dto.js';
import { UpdateSubjectDto } from '../application/dtos/update-subject.dto.js';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateSubjectDto) {
    return this.subjectsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSubjectDto) {
    return this.subjectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
