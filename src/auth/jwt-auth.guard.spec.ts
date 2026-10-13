import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Public } from './public.decorator.js';

class Controller {
  protectedRoute() {}
  @Public()
  publicRoute() {}
}

const jwt = new JwtService({ secret: 'x'.repeat(32) });
const guard = new JwtAuthGuard(new Reflector(), jwt);

function contextFor(handler: () => void, authorization?: string) {
  const request: Record<string, unknown> = { headers: { authorization } };
  const context = {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  it('deja pasar las rutas @Public() sin token', async () => {
    const { context } = contextFor(Controller.prototype.publicRoute);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rechaza una ruta protegida sin token o con esquema incorrecto', async () => {
    await expect(guard.canActivate(contextFor(Controller.prototype.protectedRoute).context)).rejects.toThrow(UnauthorizedException);
    await expect(guard.canActivate(contextFor(Controller.prototype.protectedRoute, 'Basic abc').context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un token firmado con otro secreto', async () => {
    const forged = await new JwtService({ secret: 'y'.repeat(32) }).signAsync({ sub: 't-1', email: 'a@b.c' });
    const { context } = contextFor(Controller.prototype.protectedRoute, `Bearer ${forged}`);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token expirado', async () => {
    const expired = await jwt.signAsync({ sub: 't-1', email: 'a@b.c' }, { expiresIn: -10 });
    const { context } = contextFor(Controller.prototype.protectedRoute, `Bearer ${expired}`);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('acepta un token válido y deja a la profesora en request.user', async () => {
    const token = await jwt.signAsync({ sub: 't-1', email: 'prof@example.com' });
    const { context, request } = contextFor(Controller.prototype.protectedRoute, `Bearer ${token}`);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request['user']).toEqual({ id: 't-1', email: 'prof@example.com' });
  });
});
