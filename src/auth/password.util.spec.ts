import { hashPassword, verifyPassword } from './password.util.js';

describe('password.util', () => {
  it('verifica el password correcto y rechaza uno distinto', async () => {
    const hash = await hashPassword('clave-segura');
    expect(await verifyPassword('clave-segura', hash)).toBe(true);
    expect(await verifyPassword('otra-clave', hash)).toBe(false);
  });

  it('usa un salt distinto en cada hash', async () => {
    expect(await hashPassword('igual')).not.toBe(await hashPassword('igual'));
  });

  it('no guarda el password en claro', async () => {
    expect(await hashPassword('clave-segura')).not.toContain('clave-segura');
  });

  it.each(['', 'sin-separador', ':', 'zz:'])('rechaza un hash mal formado (%j)', async (stored) => {
    expect(await verifyPassword('x', stored)).toBe(false);
  });
});
