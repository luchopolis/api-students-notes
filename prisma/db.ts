import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';

export const db = postgres<Contract>({
  contract: "./contract.prisma",
  url: process.env['DATABASE_URL']!,
});
