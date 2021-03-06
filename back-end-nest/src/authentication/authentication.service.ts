import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import TokenPayload from './tokenPayload.interface';

import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import RegisterDto from './register.dto';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  public async register(registrationData: RegisterDto) {
    if (registrationData.isFortyTwoAccount !== true) {
      await this.verifyName(registrationData.name);
    }
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    try {
      const createdUser = await this.userService.create({
        ...registrationData,
        password: hashedPassword
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === '23505') {
        throw new HttpException('User with that email or that name already exists', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong while creating a user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async verifyName(name: string) {
    if (name === "default") {
      throw new HttpException('Please choose a different name', HttpStatus.BAD_REQUEST);
    }
    let token_res = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID_42,
      client_secret: process.env.CLIENT_SECRET_42,
    });
    let user_res: AxiosResponse<any>;
    do {
      try {
        user_res = await axios.get('https://api.intra.42.fr/v2/users?filter[login]=' + name, { headers: {
          authorization: 'Bearer ' + token_res.data.access_token,
        }});
        break;
      }
      catch ({ response }) {
        if (response.status !== 429) {
          throw new HttpException('Something went wrong while connecting the 42 API', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    } while (true);
    if (user_res.data.length !== 0) {
      throw new HttpException('Please choose a different name', HttpStatus.BAD_REQUEST);
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.findByEmailLazy(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong email or password provided', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword
    );
    if (!isPasswordMatching) {
      throw new HttpException('Wrong email or password provided', HttpStatus.BAD_REQUEST);
    }
  }

  public getCookieWithJwtToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    if ("IS_HEROKU" in process.env) {
      return `Authentication=${token}; HttpOnly; Path=/; Max-Age=31536000; SameSite=None; Secure`;
    }
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=31536000; SameSite=Strict`;
  }

  public getCookieForLogOut() {
    if ("IS_HEROKU" in process.env) {
      return `Authentication=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure`;
    }
    return `Authentication=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
  }

  public getCookieWithJwtAccessToken(userId: string, isSecondFactorAuthenticated = false) {
    const payload: TokenPayload = { userId, isSecondFactorAuthenticated };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `1y`
    });
    if ("IS_HEROKU" in process.env) {
      return `Authentication=${token}; HttpOnly; Path=/; Max-Age=31536000; SameSite=None; Secure`;
    }
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=31536000; SameSite=Strict`;
  }
}
