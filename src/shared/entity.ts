import { Injectable } from '@nestjs/common';


export type Entity<T> = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export abstract class BaseEntity implements Entity<unknown> {
  constructor(
    protected _entityId?: string,
    protected _createdAt?: Date,
    protected _updatedAt?: Date,
  ) {}

  get id(): string {
    return this._entityId!;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
