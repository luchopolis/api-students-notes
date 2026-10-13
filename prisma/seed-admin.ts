import 'dotenv/config';
import { hashPassword } from '../src/auth/password.util.js';
import { PrismaTeacherRepository } from '../src/teachers/infrastructure/persistence/prisma-teacher.repository.js';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Crea (o actualiza) la profesora principal a partir de ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 * Es idempotente: se corre en cada despliegue y el `.env` es la fuente de verdad de la contraseña.
 */
async function main() {
  const email = process.env['ADMIN_EMAIL']?.trim();
  const password = process.env['ADMIN_PASSWORD'];
  const name = process.env['ADMIN_NAME']?.trim() || 'Profesora';

  if (!email || !password) {
    throw new Error('Faltan ADMIN_EMAIL y/o ADMIN_PASSWORD en el entorno');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  const teacher = await new PrismaTeacherRepository().upsertWithPassword({
    name,
    email,
    passwordHash: await hashPassword(password),
  });
  console.log(`Usuario principal listo: ${teacher.email} (${teacher.id})`);
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
