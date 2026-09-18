export class Subject {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;

  constructor(options: { id: string; code: string; name: string; description?: string | null }) {
    this.id = options.id;
    this.code = options.code;
    this.name = options.name;
    this.description = options.description ?? null;
  }
}
