import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { QueueModule } from '../queue/queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import User from '../user/user.entity';

import { AuthenticationService } from './authentication.service';
import { TwoFactorAuthenticationService } from './twoFactor/twoFactorAuthentication.service';

import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtTwoFactorStrategy } from './twoFactor/jwtTwoFactor.strategy';
import { FortyTwoStrategy } from './fortyTwo.strategy';

import { AuthenticationController } from './authentication.controller';
import { TwoFactorAuthenticationController } from './twoFactor/twoFactorAuthentication.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserModule,
    QueueModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `1y`,
        },
      }),
    }),
  ],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy, TwoFactorAuthenticationService, JwtTwoFactorStrategy, FortyTwoStrategy],
  controllers: [AuthenticationController, TwoFactorAuthenticationController],
  exports: [AuthenticationService]
})
export class AuthenticationModule {}
