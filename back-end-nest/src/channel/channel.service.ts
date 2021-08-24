import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import User from '../user/user.entity';
import Channel from '../channel/channel.entity';
import Participant from '../participant/participant.entity';

import { UserService } from '../user/user.service';

import ChannelCreationDto from './channelCreation.dto';


@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
    private readonly userService: UserService,
  ) {}

  async create(data: ChannelCreationDto) {
    let channel = new Channel();
    channel.channelName = data.channelName;
    channel.channelStatus = data.channelStatus;
    channel.password = data.password;
    const owner = await this.userService.getById(data.ownerId);
    channel.owner = owner;
    await this.channelRepo.save(channel);
  }

  public async getById(id: string) {
    const channel = await this.channelRepo.findOne( id, { relations: ['participants'] } );
    if (channel) {
      return channel;
    }
    throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
  }

/*
  async findAll() {
    return await this.channelRepo.find({ relations: ['participants'] });
  }

  async findOne(channelId: string) {
    const channel = await this.channelRepo.findOne(channelId, { relations: ['participants'] });
    if (channel === undefined) { return "[Error]: No channel at this id!"; }
    return channel;
  }

  async getParticipants(channelId: string) {
    const channel = await this.channelRepo.findOne(channelId, { relations: ['participants'] });
    if (channel === undefined) { return "[Error]: No channel at this id!"; }
    return channel.participants;
  }

  async delete(channelId: string) {
    const channel = await this.channelRepo.findOne(channelId, { relations: ['participants'] });
    if (channel === undefined) { return "[Error]: No channel at this id!"; }
    await this.channelRepo.delete(channelId);
    return await this.channelRepo.find({ relations: ['participants'] });
  }
*/
}
