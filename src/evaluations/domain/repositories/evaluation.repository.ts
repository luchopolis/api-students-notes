import { Evaluation, EvaluationType } from '../entities/evaluation.entity.js';

export const EVALUATION_REPOSITORY = Symbol('EVALUATION_REPOSITORY');

export type CreateEvaluationInput = {
  periodId: string;
  type: EvaluationType;
  weight: number;
  activityOrder: number;
};

export interface IEvaluationRepository {
  findAllByPeriodId(periodId: string): Promise<Evaluation[]>;
  findById(id: string): Promise<Evaluation | null>;
  create(data: CreateEvaluationInput): Promise<Evaluation>;
  updateWeight(id: string, weight: number): Promise<Evaluation | null>;
}
