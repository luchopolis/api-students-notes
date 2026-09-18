import 'dotenv/config';

export type S3Config = {
  bucket: string;
  region: string;
  endpoint?: string;
  forcePathStyle: boolean;
  credentials?: { accessKeyId: string; secretAccessKey: string };
};

export function loadS3Config(env: NodeJS.ProcessEnv = process.env): S3Config {
  const missing = ['S3_BUCKET', 'S3_REGION'].filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required S3 environment variables: ${missing.join(', ')}`);
  }

  const accessKeyId = env['S3_ACCESS_KEY_ID'];
  const secretAccessKey = env['S3_SECRET_ACCESS_KEY'];
  if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY must be set together');
  }

  return {
    bucket: env['S3_BUCKET']!,
    region: env['S3_REGION']!,
    endpoint: env['S3_ENDPOINT'] || undefined,
    forcePathStyle: env['S3_FORCE_PATH_STYLE'] === 'true',
    // Sin credenciales explícitas el SDK usa su cadena por defecto (perfil, IAM role, etc.)
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  };
}
