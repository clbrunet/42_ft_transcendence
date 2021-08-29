import { Entity, Unique, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import  User  from '../user/user.entity';
import  Channel  from '../channel/channel.entity';
import  Message  from '../message/message.entity';

@Entity()
@Unique(["user", "channel"])
class Participant {
    @PrimaryGeneratedColumn('uuid')
    public id?: string;

    @ManyToOne(() => User, user => user.participants, { eager: true, onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Channel, channel => channel.participants, { eager: true, onDelete: "CASCADE" })
    channel: Channel;

    @Column({ type: 'boolean', default: false })
    admin: boolean;

    @Column({ type: 'boolean', default: false })
    mute: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    muteDateTime: Date;

    @Column({ type: 'boolean', default: false })
    ban: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    banDateTime: Date;

    @OneToMany(() => Message, message => message.author)
    messages: Message[];
}

export default Participant;