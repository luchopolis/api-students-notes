import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Deja una ruta fuera del `JwtAuthGuard` global (que protege todo por defecto). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
