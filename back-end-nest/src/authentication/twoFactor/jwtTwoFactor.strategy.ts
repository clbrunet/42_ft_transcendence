import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import TokenPayload from '../tokenPayload.interface';

import { UserService } from '../../user/user.service';


@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwtTwoFactor') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
        return request?.cookies?.Authentication;
      }]),
      secretOrKey: configService.get('JWT_SECRET')
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.findByIdLazy(payload.userId);
    if (!user.isTwoFactorAuthenticationEnabled) {
      return user;
    }
    if (payload.isSecondFactorAuthenticated) {
      return user;
    }
  }
}
