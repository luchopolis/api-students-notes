import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVALUATION_REPOSITORY } from '../../evaluations/domain/repositories/evaluation.repository.js';
import type { IEvaluationRepository } from '../../evaluations/domain/repositories/evaluation.repository.js';
import { ACTIVITY_REPOSITORY } from '../../activities/domain/repositories/activity.repository.js';
import type { IActivityRepository } from '../../activities/domain/repositories/activity.repository.js';
import { SUB_ACTIVITY_REPOSITORY } from '../../sub-activities/domain/repositories/sub-activity.repository.js';
import type { ISubActivityRepository } from '../../sub-activities/domain/repositories/sub-activity.repository.js';
import { GRADE_REPOSITORY } from '../domain/repositories/grade.repository.js';
import type { IGradeRepository } from '../domain/repositories/grade.repository.js';
import { PERIOD_REPOSITORY } from '../../periods/domain/repositories/period.repository.js';
import type { IPeriodRepository } from '../../periods/domain/repositories/period.repository.js';
import { ENROLLMENT_REPOSITORY } from '../../enrollments/domain/repositories/enrollment.repository.js';
import type { IEnrollmentRepository } from '../../enrollments/domain/repositories/enrollment.repository.js';

const WEIGHT_SUM_TOLERANCE = 0.01;

export type SubActivityGradeBreakdown = {
  subActivityId: string;
  name: string;
  weight: number;
  gradeValue: number;
};

export type ActivityGradeResult = {
  activityId: string;
  name: string;
  weight: number;
  grade: number;
  subActivities: SubActivityGradeBreakdown[] | null;
};

export type EvaluationGradeResult = {
  evaluationId: string;
  type: string;
  grade: number;
  activities: ActivityGradeResult[];
};

export type PeriodGradeResult = {
  periodId: string;
  grade: number;
  evaluations: { evaluationId: string; type: string; weight: number; grade: number }[];
};

export type YearGradeResult = {
  academicYearId: string;
  grade: number;
  periods: { periodId: string; number: number; grade: number }[];
};

function assertWeightsSumTo100(weights: number[], subject: string): void {
  const sum = weights.reduce((total, weight) => total + weight, 0);
  if (Math.abs(sum - 100) > WEIGHT_SUM_TOLERANCE) {
    throw new BadRequestException(`${subject} weights must add up to 100 (currently ${sum}).`);
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class GradeCalculationService {
  constructor(
    @Inject(EVALUATION_REPOSITORY) private readonly evaluationRepository: IEvaluationRepository,
    @Inject(ACTIVITY_REPOSITORY) private readonly activityRepository: IActivityRepository,
    @Inject(SUB_ACTIVITY_REPOSITORY) private readonly subActivityRepository: ISubActivityRepository,
    @Inject(GRADE_REPOSITORY) private readonly gradeRepository: IGradeRepository,
    @Inject(PERIOD_REPOSITORY) private readonly periodRepository: IPeriodRepository,
    @Inject(ENROLLMENT_REPOSITORY) private readonly enrollmentRepository: IEnrollmentRepository,
  ) {}

  async getActivityGrade(enrollmentId: string, activityId: string): Promise<ActivityGradeResult> {
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }

    const subActivities = await this.subActivityRepository.findAllByActivityId(activityId);
    const grades = await this.gradeRepository.findAllByEnrollmentId(enrollmentId);

    if (subActivities.length === 0) {
      const grade = grades.find((g) => g.activityId === activityId);
      if (!grade) {
        throw new BadRequestException(
          `Enrollment ${enrollmentId} has no grade for activity "${activity.name}" (${activityId}).`,
        );
      }
      return {
        activityId,
        name: activity.name,
        weight: activity.weight,
        grade: grade.gradeValue,
        subActivities: null,
      };
    }

    assertWeightsSumTo100(
      subActivities.map((sub) => sub.weight),
      `Sub-activities of activity ${activityId}`,
    );

    const gradeBySubActivityId = new Map(grades.map((grade) => [grade.subActivityId, grade]));
    const breakdown: SubActivityGradeBreakdown[] = subActivities.map((sub) => {
      const grade = gradeBySubActivityId.get(sub.id);
      if (!grade) {
        throw new BadRequestException(
          `Enrollment ${enrollmentId} has no grade for sub-activity "${sub.name}" (${sub.id}).`,
        );
      }
      return { subActivityId: sub.id, name: sub.name, weight: sub.weight, gradeValue: grade.gradeValue };
    });

    const grade = breakdown.reduce((total, s) => total + (s.gradeValue * s.weight) / 100, 0);

    return {
      activityId,
      name: activity.name,
      weight: activity.weight,
      grade: round2(grade),
      subActivities: breakdown,
    };
  }

  async getEvaluationGrade(enrollmentId: string, evaluationId: string): Promise<EvaluationGradeResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    }

    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation ${evaluationId} not found`);
    }

    const activities = await this.activityRepository.findAllByEvaluationId(
      evaluationId,
      enrollment.subjectId,
    );
    if (activities.length === 0) {
      throw new BadRequestException(
        `Evaluation ${evaluationId} has no activities to grade for subject ${enrollment.subjectId}.`,
      );
    }
    assertWeightsSumTo100(
      activities.map((activity) => activity.weight),
      `Activities of evaluation ${evaluationId}`,
    );

    const activityGrades = await Promise.all(
      activities.map((activity) => this.getActivityGrade(enrollmentId, activity.id)),
    );

    const grade = activityGrades.reduce((total, a) => total + (a.grade * a.weight) / 100, 0);

    return { evaluationId, type: evaluation.type, grade: round2(grade), activities: activityGrades };
  }

  async getPeriodGrade(enrollmentId: string, periodId: string): Promise<PeriodGradeResult> {
    const evaluations = await this.evaluationRepository.findAllByPeriodId(periodId);
    if (evaluations.length === 0) {
      throw new NotFoundException(`Period ${periodId} not found or has no evaluations.`);
    }
    assertWeightsSumTo100(
      evaluations.map((evaluation) => evaluation.weight),
      `Evaluations of period ${periodId}`,
    );

    const evaluationGrades = await Promise.all(
      evaluations.map((evaluation) => this.getEvaluationGrade(enrollmentId, evaluation.id)),
    );

    const grade = evaluationGrades.reduce((total, result, index) => {
      const weight = evaluations[index]!.weight;
      return total + (result.grade * weight) / 100;
    }, 0);

    return {
      periodId,
      grade: round2(grade),
      evaluations: evaluationGrades.map((result, index) => ({
        evaluationId: result.evaluationId,
        type: result.type,
        weight: evaluations[index]!.weight,
        grade: result.grade,
      })),
    };
  }

  async getYearGrade(enrollmentId: string): Promise<YearGradeResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${enrollmentId} not found`);
    }

    const periods = await this.periodRepository.findAllByAcademicYearId(enrollment.academicYearId);
    if (periods.length === 0) {
      throw new NotFoundException(`AcademicYear ${enrollment.academicYearId} has no periods.`);
    }

    const periodGrades = await Promise.all(
      periods.map((period) => this.getPeriodGrade(enrollment.id, period.id)),
    );

    const grade = periodGrades.reduce((total, result) => total + result.grade, 0) / periodGrades.length;

    return {
      academicYearId: enrollment.academicYearId,
      grade: round2(grade),
      periods: periodGrades.map((result, index) => ({
        periodId: result.periodId,
        number: periods[index]!.number,
        grade: result.grade,
      })),
    };
  }
}
