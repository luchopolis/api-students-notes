import { BadRequestException, ConflictException } from '@nestjs/common';

type SqlQueryError = {
  kind?: string;
  sqlState?: string;
  constraint?: string;
  table?: string;
  column?: string;
};

function isSqlQueryError(err: unknown): err is SqlQueryError {
  return typeof err === 'object' && err !== null && 'sqlState' in err;
}

/**
 * Postgres SQLSTATE 23505 (unique_violation) and 23503 (foreign_key_violation)
 * surface from the ORM lane as SqlQueryError, not as a Nest-friendly exception.
 * Call this from a catch block to translate them into 409/400 responses.
 */
export function rethrowAsHttpException(err: unknown): never {
  if (isSqlQueryError(err)) {
    if (err.sqlState === '23505') {
      throw new ConflictException(
        err.constraint ? `Duplicate value violates constraint "${err.constraint}"` : 'Duplicate value',
      );
    }
    if (err.sqlState === '23503') {
      throw new BadRequestException(
        err.constraint ? `Referenced record does not exist ("${err.constraint}")` : 'Referenced record does not exist',
      );
    }
  }
  throw err;
}
