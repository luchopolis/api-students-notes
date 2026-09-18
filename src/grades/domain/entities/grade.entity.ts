export const GRADE_STATUSES = ['PENDING', 'SUBMITTED', 'GRADING'] as const;
export type GradeStatus = (typeof GRADE_STATUSES)[number];

export class Grade {
  readonly id: string;
  readonly enrollmentId: string;
  readonly activityId: string | null;
  readonly subActivityId: string | null;
  readonly gradeValue: number;
  readonly submissionDate: string | null;
  readonly status: GradeStatus;

  constructor(options: {
    id: string;
    enrollmentId: string;
    activityId?: string | null;
    subActivityId?: string | null;
    gradeValue: number;
    submissionDate?: string | null;
    status: GradeStatus;
  }) {
    this.id = options.id;
    this.enrollmentId = options.enrollmentId;
    this.activityId = options.activityId ?? null;
    this.subActivityId = options.subActivityId ?? null;
    this.gradeValue = options.gradeValue;
    this.submissionDate = options.submissionDate ?? null;
    this.status = options.status;
  }
}
