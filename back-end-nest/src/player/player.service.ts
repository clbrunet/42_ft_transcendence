import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Player from './player.entity';
import User from '../user/user.entity';
import Game from '../game/game.entity';

import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';

import { PlayerDto } from './player.dto';
import { PlayerUpdateDto } from './player.dto';


@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepo: Repository<Player>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,

    private readonly userService: UserService,
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
  ) {}

  public async create(userId: string, gameId: string) {
    const user = await this.userService.findByIdLazy(userId);
    if (!user) {
      throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }
    const game = await this.gameService.findById(gameId);
    if (!game) {
      throw new HttpException('Game with this id does not exist', HttpStatus.NOT_FOUND);
    }
    if (game.players.length == 2) {
      throw new HttpException('Already two players in that game', HttpStatus.BAD_REQUEST); 
    }
    let player = new Player();
    player.user = user;
    player.game = game;
    let res;
    try {
      res = await this.playerRepo.save(player);
    }
    catch(error) {
      if (error?.code === '23505') {
        throw new HttpException('User is already a Player of that Game', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Something went wrong while creating a player', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.playerToDto(res);
  }

  // Return all Player objects with all joined tables
  public async findAll() {
    return await this.playerRepo.find(
      {
        join: {
          alias: "player",
          leftJoinAndSelect: {
            user: "player.user",
            game: "player.game",
          },
        },
      }
    );    
  }

  // Return all Player objects without any joined tables
  public async findAllLazy() {
    return await this.playerRepo.find();    
  }

  // Return Player Dto with all joined tables
  public async getById(id: string) {
    const player = await this.playerRepo.findOne(id,
      {
        join: {
          alias: "player",
          leftJoinAndSelect: {
            user: "player.user",
            game: "player.game",
          },
        },
      }
    );
    if (player) { 
      return this.playerToDto(player);
    }
    throw new HttpException('Player with this id does not exist', HttpStatus.NOT_FOUND);
  }

  // Return Player Object with all joined tables
  public async findById(id: string) {
    const player = await this.playerRepo.findOne(id,
      {
        join: {
          alias: "player",
          leftJoinAndSelect: {
            user: "player.user",
            game: "player.game",
          },
        },
      }  
    );
    if (player) {
      return player;
    }
    throw new HttpException('Player with this id does not exist', HttpStatus.NOT_FOUND);
  }

  // Return Player Object without any joined tables
  public async findByIdLazy(id: string) {
    const player = await this.playerRepo.findOne(id);
    if (player) {
      return player;
    }
    throw new HttpException('Player with this id does not exist', HttpStatus.NOT_FOUND);
  }

  // Return Player Object with all joined tables
  public async findByGameAndUser(gameId: string, userId: string) {
    const game = await this.gameService.findByIdLazy(gameId);
    const user = await this.userService.findByIdLazy(userId);
    const player = await this.playerRepo.findOne( { game, user },
      {
        join: {
          alias: "player",
          leftJoinAndSelect: {
            user: "player.user",
            game: "player.game",
          },
        },
      }
    );
    if (player) {
      return player;
    }
    throw new HttpException('Player with this (gameId, userId) does not exist', HttpStatus.NOT_FOUND);
  }

  // Return Player Object without any joined tables
  public async findByGameAndUserLazy(gameId: string, userId: string) {
    const game = await this.gameService.findByIdLazy(gameId);
    const user = await this.userService.findByIdLazy(userId);
    const player = await this.playerRepo.findOne( { game, user } );
    if (player) {
      return player;
    }
    throw new HttpException('Player with this (gameId, userId) does not exist', HttpStatus.NOT_FOUND);
  }

  public async update(id: string, playerUpdateDto: PlayerUpdateDto) {
    const res = await this.playerRepo.update(id, playerUpdateDto);
    if (res) {
      const player = await this.findById(id);
      return this.playerToDto(player);
    }
    throw new HttpException('Player update failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  public async score(gameId: string, userId: string, addedPoint: number) {
    const player = await this.findByGameAndUser(gameId, userId);
    if (player.point + addedPoint > player.game.pointToVictory) {
      throw new HttpException('A player can not have a more point than pointToVictory', HttpStatus.BAD_REQUEST);
    }
    let playerUpdateDto = new PlayerUpdateDto();
    playerUpdateDto.point = player.point + addedPoint;
    return await this.update(player.id, playerUpdateDto);
  }

  public async delete(id: string) {
    try {
      await this.findByIdLazy(id);
    }
    catch(error) {
      throw new HttpException('Player with this id does not exist', HttpStatus.NOT_FOUND); 
    }
    await this.playerRepo.delete(id);
    return "Successfull Player deletion";
  }

  public playerToDto(player: Player) {
    let dto = new PlayerDto();
    dto.id = player.id;
    dto.userId = player.user.id;
    dto.userName = player.user.name;
    dto.gameId = player.game.id;
    dto.point = player.point;
    return dto;
  }
}
