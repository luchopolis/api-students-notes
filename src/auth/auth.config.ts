import 'dotenv/config';

export type AuthConfig = {
  jwtSecret: string;
  /** Formato de `ms`/jsonwebtoken: "7d", "12h", "3600"… */
  jwtExpiresIn: string;
};

const MIN_SECRET_LENGTH = 32;

export function loadAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const jwtSecret = env['JWT_SECRET'];
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  if (jwtSecret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters (try: openssl rand -base64 48)`);
  }

  return { jwtSecret, jwtExpiresIn: env['JWT_EXPIRES_IN'] || '7d' };
}
