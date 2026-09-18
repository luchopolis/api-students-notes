export class Student {
  readonly id: string;
  readonly dni: string;
  readonly firstName: string;
  readonly lastName1: string;
  readonly lastName2: string | null;
  readonly birthDate: string;
  readonly email: string;

  constructor(options: {
    id: string;
    dni: string;
    firstName: string;
    lastName1: string;
    lastName2?: string | null;
    birthDate: string;
    email: string;
  }) {
    this.id = options.id;
    this.dni = options.dni;
    this.firstName = options.firstName;
    this.lastName1 = options.lastName1;
    this.lastName2 = options.lastName2 ?? null;
    this.birthDate = options.birthDate;
    this.email = options.email;
  }

  get fullName(): string {
    return [this.firstName, this.lastName1, this.lastName2].filter(Boolean).join(' ');
  }
}
