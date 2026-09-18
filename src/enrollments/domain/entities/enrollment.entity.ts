export class Enrollment {
  readonly id: string;
  readonly studentId: string;
  readonly subjectId: string;
  readonly academicYearId: string;
  readonly registrationDate: string;

  constructor(options: {
    id: string;
    studentId: string;
    subjectId: string;
    academicYearId: string;
    registrationDate: string;
  }) {
    this.id = options.id;
    this.studentId = options.studentId;
    this.subjectId = options.subjectId;
    this.academicYearId = options.academicYearId;
    this.registrationDate = options.registrationDate;
  }
}
