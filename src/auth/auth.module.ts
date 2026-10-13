import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TeachersModule } from '../teachers/teachers.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { loadAuthConfig } from './auth.config.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Module({
  imports: [
    TeachersModule,
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => {
        const { jwtSecret, jwtExpiresIn } = loadAuthConfig();
        return { secret: jwtSecret, signOptions: { expiresIn: jwtExpiresIn as JwtSignOptions['expiresIn'] } };
      },
    }),
    // Solo se aplica donde se use `ThrottlerGuard` explícitamente (el login); no es un guard global.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
