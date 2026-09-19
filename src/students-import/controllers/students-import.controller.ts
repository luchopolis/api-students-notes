import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type {} from 'multer';
import { StudentsImportService } from '../services/students-import.service.js';
import { ImportStudentsDto } from '../application/dtos/import-students.dto.js';

@Controller('students/import')
export class StudentsImportController {
  constructor(private readonly studentsImportService: StudentsImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  importFromExcel(@UploadedFile() file: Express.Multer.File, @Body() data: ImportStudentsDto) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.studentsImportService.import(file.buffer, data);
  }
}
