export class Period {
  readonly id: string;
  readonly academicYearId: string;
  readonly number: number;
  readonly name: string;

  constructor(options: { id: string; academicYearId: string; number: number; name: string }) {
    this.id = options.id;
    this.academicYearId = options.academicYearId;
    this.number = options.number;
    this.name = options.name;
  }
}
