import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TeachersService } from '../services/teachers.service.js';
import { CreateTeacherDto } from '../application/dtos/create-teacher.dto.js';
import { UpdateTeacherDto } from '../application/dtos/update-teacher.dto.js';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateTeacherDto) {
    return this.teachersService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateTeacherDto) {
    return this.teachersService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
