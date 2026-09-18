export class SubActivity {
  readonly id: string;
  readonly activityId: string;
  readonly name: string;
  readonly weight: number;
  readonly description: string | null;

  constructor(options: {
    id: string;
    activityId: string;
    name: string;
    weight: number;
    description?: string | null;
  }) {
    this.id = options.id;
    this.activityId = options.activityId;
    this.name = options.name;
    this.weight = options.weight;
    this.description = options.description ?? null;
  }
}
