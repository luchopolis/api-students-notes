import { Controller, Get, Param } from '@nestjs/common';
import { GradeCalculationService } from '../services/grade-calculation.service.js';

@Controller('enrollments/:enrollmentId/grades')
export class GradeCalculationsController {
  constructor(private readonly gradeCalculationService: GradeCalculationService) {}

  @Get('activities/:activityId')
  getActivityGrade(@Param('enrollmentId') enrollmentId: string, @Param('activityId') activityId: string) {
    return this.gradeCalculationService.getActivityGrade(enrollmentId, activityId);
  }

  @Get('evaluations/:evaluationId')
  getEvaluationGrade(
    @Param('enrollmentId') enrollmentId: string,
    @Param('evaluationId') evaluationId: string,
  ) {
    return this.gradeCalculationService.getEvaluationGrade(enrollmentId, evaluationId);
  }

  @Get('periods/:periodId')
  getPeriodGrade(@Param('enrollmentId') enrollmentId: string, @Param('periodId') periodId: string) {
    return this.gradeCalculationService.getPeriodGrade(enrollmentId, periodId);
  }

  @Get('year')
  getYearGrade(@Param('enrollmentId') enrollmentId: string) {
    return this.gradeCalculationService.getYearGrade(enrollmentId);
  }
}
