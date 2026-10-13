import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TEACHER_REPOSITORY } from '../teachers/domain/repositories/teacher.repository.js';
import type { ITeacherRepository } from '../teachers/domain/repositories/teacher.repository.js';
import { Teacher } from '../teachers/domain/entities/teacher.entity.js';
import { LoginDto } from './application/dtos/login.dto.js';
import { hashPassword, verifyPassword } from './password.util.js';

export type LoginResult = { accessToken: string; teacher: Teacher };

@Injectable()
export class AuthService {
  // Hash de relleno: si el email no existe igual gastamos un scrypt, para que el tiempo de respuesta no delate qué emails están registrados.
  private readonly dummyHash = hashPassword('sin-usuario');

  constructor(
    @Inject(TEACHER_REPOSITORY) private readonly teachers: ITeacherRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto): Promise<LoginResult> {
    const credentials = await this.teachers.findCredentialsByEmail(email.trim());
    const passwordMatches = await verifyPassword(password, credentials?.passwordHash ?? (await this.dummyHash));

    if (!credentials?.passwordHash || !passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { teacher } = credentials;
    const accessToken = await this.jwtService.signAsync({ sub: teacher.id, email: teacher.email });
    return { accessToken, teacher };
  }

  async me(teacherId: string): Promise<Teacher> {
    const teacher = await this.teachers.findById(teacherId);
    if (!teacher) {
      throw new UnauthorizedException('La sesión ya no corresponde a un usuario existente');
    }
    return teacher;
  }
}
