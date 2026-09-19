import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SharedModule } from './shared/shared.module.js';
import { StudentsModule } from './students/students.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { AcademicYearsModule } from './academic-years/academic-years.module.js';
import { PeriodsModule } from './periods/periods.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { EvaluationsModule } from './evaluations/evaluations.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { SubActivitiesModule } from './sub-activities/sub-activities.module.js';
import { GradesModule } from './grades/grades.module.js';
import { PeriodFilesModule } from './period-files/period-files.module.js';
import { StudentsImportModule } from './students-import/students-import.module.js';

@Module({
  imports: [
    SharedModule,
    StudentsModule,
    TeachersModule,
    AcademicYearsModule,
    PeriodsModule,
    SubjectsModule,
    EnrollmentsModule,
    EvaluationsModule,
    ActivitiesModule,
    SubActivitiesModule,
    GradesModule,
    PeriodFilesModule,
    StudentsImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
