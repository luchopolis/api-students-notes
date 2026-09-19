import { Module } from '@nestjs/common';
import { StudentsImportController } from './controllers/students-import.controller.js';
import { StudentsImportService } from './services/students-import.service.js';
import { StudentsModule } from '../students/students.module.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { SubjectsModule } from '../subjects/subjects.module.js';
import { AcademicYearsModule } from '../academic-years/academic-years.module.js';
import { ExcelModule } from '../shared/excel/excel.module.js';

@Module({
  imports: [StudentsModule, EnrollmentsModule, SubjectsModule, AcademicYearsModule, ExcelModule],
  controllers: [StudentsImportController],
  providers: [StudentsImportService],
})
export class StudentsImportModule {}
