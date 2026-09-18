export class PeriodFile {
  readonly id: string;
  readonly periodId: string;
  readonly subjectId: string;
  readonly fileName: string;
  readonly storageKey: string;
  readonly generatedAt: string;

  constructor(options: {
    id: string;
    periodId: string;
    subjectId: string;
    fileName: string;
    storageKey: string;
    generatedAt: string;
  }) {
    this.id = options.id;
    this.periodId = options.periodId;
    this.subjectId = options.subjectId;
    this.fileName = options.fileName;
    this.storageKey = options.storageKey;
    this.generatedAt = options.generatedAt;
  }
}
