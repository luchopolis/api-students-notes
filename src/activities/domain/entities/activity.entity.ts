export class Activity {
  readonly id: string;
  readonly evaluationId: string;
  readonly name: string;
  readonly weight: number;
  readonly description: string | null;

  constructor(options: {
    id: string;
    evaluationId: string;
    name: string;
    weight: number;
    description?: string | null;
  }) {
    this.id = options.id;
    this.evaluationId = options.evaluationId;
    this.name = options.name;
    this.weight = options.weight;
    this.description = options.description ?? null;
  }
}
