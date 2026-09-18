import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {} from 'multer';
import { StudentsService } from '../services/students.service.js';
import { CreateStudentDto } from '../application/dtos/create-student.dto.js';
import { UpdateStudentDto } from '../application/dtos/update-student.dto.js';
import { ParseStudentsToJson } from '../../shared/excel/application/use-cases/parse-students-to-json.js';

@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly parseStudentsToJson: ParseStudentsToJson,
  ) {}

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.studentsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateStudentDto) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.parseStudentsToJson.execute(file.buffer);
  }
}
