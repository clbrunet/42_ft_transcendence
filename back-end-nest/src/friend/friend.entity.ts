import { Entity, Unique, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { FriendStatus } from './enum.friendStatus';

import User  from '../user/user.entity';


@Entity()
@Unique(["friendOwner", "friend"])
class Friend {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column()
    status: FriendStatus;

    @ManyToOne(() => User, user => user.friendOwners, { eager: false, onDelete: "CASCADE" })
    friendOwner: User;

    @ManyToOne(() => User, user => user.friends, { eager: false, onDelete: "CASCADE" })
    friend: User;
}

export default Friend;