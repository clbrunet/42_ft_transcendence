import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import RequestWithUser from '../authentication/requestWithUser.interface';

import Channel from './channel.entity';

import { ChannelService } from './channel.service';

import JwtTwoFactorGuard from '../authentication/twoFactor/jwtTwoFactor.guard';

import { ChannelCreationDto } from './channel.dto';
import { ChannelUpdateDto } from './channel.dto';
import { ParticipantCreationDto } from '../participant/participant.dto';
import { MuteBanDto } from './channel.dto';
import { AuthorizationDto } from './channel.dto';


@Controller('channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService
  ) {}

  // ROUTES FOR N CHANNELS
  @UseGuards(JwtTwoFactorGuard)
  @Get('/index')
  async getAllActiveUser(@Req() request: RequestWithUser) {
    const {user} = request;
    return await this.channelService.getAllActiveUser(user.id);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get(':id')
  async getById(@Param('id') id) {
    return await this.channelService.getById(id);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('/create')
  async create(@Req() request: RequestWithUser, @Body() channelCreationDto: ChannelCreationDto) {
    const {user} = request;
    channelCreationDto.ownerId = user.id;
    return this.channelService.create(channelCreationDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Patch('/changeOwner/:id')
  async changeOwnerActiveUser(@Req() request: RequestWithUser, @Param('id') id, @Body() channelUpdateDto: ChannelUpdateDto) {
    const {user} = request;
    return await this.channelService.changeOwnerActiveUser(user.id, id, channelUpdateDto.ownerId);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Patch('/changeStatus/:id')
  async changeStatusActiveUser(@Req() request: RequestWithUser, @Param('id') id, @Body() channelUpdateDto: ChannelUpdateDto) {
    const {user} = request;
    return await this.channelService.changeStatusActiveUser(user.id, id, channelUpdateDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('/addAdmin')
  async addAdminActiveUser(@Req() request: RequestWithUser, @Body() participantCreationDto: ParticipantCreationDto) {
    const {user} = request;
    return await this.channelService.addAdminActiveUser(user.id, participantCreationDto.channelId, participantCreationDto.userId);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('/addParticipant')
  async addParticipantActiveUser(@Req() request: RequestWithUser, @Body() participantCreationDto: ParticipantCreationDto) {
    const {user} = request;
    return await this.channelService.addParticipantActiveUser(user.id, participantCreationDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('/mute')
  async muteActiveUser(@Req() request: RequestWithUser, @Body() muteBanDto: MuteBanDto) {
    const {user} = request;
    return await this.channelService.muteActiveUser(user.id, muteBanDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('/ban')
  async banActiveUser(@Req() request: RequestWithUser, @Body() muteBanDto: MuteBanDto) {
    const {user} = request;
    return await this.channelService.banActiveUser(user.id, muteBanDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Patch('/authorization')
  async authorizeActiveUser(@Req() request: RequestWithUser, @Body() authorizationDto: AuthorizationDto) {
    const {user} = request;
    return await this.channelService.authorizeActiveUser(user.id, authorizationDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Patch('/leave/:id')
  async leaveActiveUser(@Req() request: RequestWithUser, @Param('id') id) {
    const {user} = request;
    return await this.channelService.leaveActiveUser(user.id, id);
  }

  // ROUTES FOR 1T1 CHANNELS



  // ROUTES FOR DEV ONLY TO BE COMMENTED
  @UseGuards(JwtTwoFactorGuard)
  @Get('/all/:direct')
  async findAll(@Param('direct') direct) {
    return await this.channelService.findAll(direct);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Delete('/:id')
  async delete(@Param('id') id) {
    return await this.channelService.delete(id);
  }
}
