import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { hashPassword } from './password.util.js';
import { Teacher } from '../teachers/domain/entities/teacher.entity.js';
import type { ITeacherRepository } from '../teachers/domain/repositories/teacher.repository.js';

const teacher = new Teacher({ id: 't-1', name: 'Profesora', email: 'prof@example.com' });

function setup(passwordHash: string | null | undefined) {
  const repository = {
    findCredentialsByEmail: vi.fn(async (email: string) =>
      passwordHash !== undefined && email === teacher.email ? { teacher, passwordHash } : null,
    ),
    findById: vi.fn(async (id: string) => (id === teacher.id ? teacher : null)),
  } as unknown as ITeacherRepository;
  const jwt = new JwtService({ secret: 'x'.repeat(32) });
  return { service: new AuthService(repository, jwt), jwt };
}

describe('AuthService', () => {
  it('devuelve un token firmado y la profesora con credenciales correctas', async () => {
    const { service, jwt } = setup(await hashPassword('clave-segura'));

    const result = await service.login({ email: teacher.email, password: 'clave-segura' });

    expect(result.teacher).toBe(teacher);
    expect(await jwt.verifyAsync(result.accessToken)).toMatchObject({ sub: 't-1', email: teacher.email });
  });

  it('rechaza un password incorrecto', async () => {
    const { service } = setup(await hashPassword('clave-segura'));
    await expect(service.login({ email: teacher.email, password: 'mala' })).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un email que no existe con el mismo mensaje que un password incorrecto', async () => {
    const { service } = setup(await hashPassword('clave-segura'));
    const wrongPassword = await service.login({ email: teacher.email, password: 'mala' }).catch((e: Error) => e.message);
    const unknownEmail = await service.login({ email: 'otra@example.com', password: 'mala' }).catch((e: Error) => e.message);
    expect(unknownEmail).toBe(wrongPassword);
  });

  it('rechaza a una profesora que todavía no tiene contraseña', async () => {
    const { service } = setup(null);
    await expect(service.login({ email: teacher.email, password: 'lo-que-sea' })).rejects.toThrow(UnauthorizedException);
  });

  it('me() falla si la profesora del token ya no existe', async () => {
    const { service } = setup(null);
    await expect(service.me('borrada')).rejects.toThrow(UnauthorizedException);
    await expect(service.me('t-1')).resolves.toBe(teacher);
  });
});
