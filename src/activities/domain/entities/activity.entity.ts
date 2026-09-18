export class Activity {
  readonly id: string;
  readonly evaluationId: string;
  readonly subjectId: string;
  readonly name: string;
  readonly weight: number;
  readonly description: string | null;

  constructor(options: {
    id: string;
    evaluationId: string;
    subjectId: string;
    name: string;
    weight: number;
    description?: string | null;
  }) {
    this.id = options.id;
    this.evaluationId = options.evaluationId;
    this.subjectId = options.subjectId;
    this.name = options.name;
    this.weight = options.weight;
    this.description = options.description ?? null;
  }
}
