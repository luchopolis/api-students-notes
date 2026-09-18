export class AcademicYear {
  readonly id: string;
  readonly yearName: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly teacherId: string;

  constructor(options: {
    id: string;
    yearName: string;
    startDate: string;
    endDate: string;
    teacherId: string;
  }) {
    this.id = options.id;
    this.yearName = options.yearName;
    this.startDate = options.startDate;
    this.endDate = options.endDate;
    this.teacherId = options.teacherId;
  }
}
