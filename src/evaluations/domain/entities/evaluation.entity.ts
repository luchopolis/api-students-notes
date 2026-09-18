export const EVALUATION_TYPES = ['NOTE_1', 'NOTE_2', 'EXAM'] as const;
export type EvaluationType = (typeof EVALUATION_TYPES)[number];

export class Evaluation {
  readonly id: string;
  readonly periodId: string;
  readonly type: EvaluationType;
  readonly weight: number;
  readonly activityOrder: number;

  constructor(options: {
    id: string;
    periodId: string;
    type: EvaluationType;
    weight: number;
    activityOrder: number;
  }) {
    this.id = options.id;
    this.periodId = options.periodId;
    this.type = options.type;
    this.weight = options.weight;
    this.activityOrder = options.activityOrder;
  }
}
