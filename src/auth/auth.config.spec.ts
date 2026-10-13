import { loadAuthConfig } from './auth.config.js';

describe('loadAuthConfig', () => {
  it('exige JWT_SECRET', () => {
    expect(() => loadAuthConfig({})).toThrow('JWT_SECRET');
  });

  it('rechaza un secreto corto', () => {
    expect(() => loadAuthConfig({ JWT_SECRET: 'corto' })).toThrow('at least 32');
  });

  it('usa 7d por defecto y respeta JWT_EXPIRES_IN', () => {
    const secret = 'x'.repeat(32);
    expect(loadAuthConfig({ JWT_SECRET: secret }).jwtExpiresIn).toBe('7d');
    expect(loadAuthConfig({ JWT_SECRET: secret, JWT_EXPIRES_IN: '12h' }).jwtExpiresIn).toBe('12h');
  });
});
