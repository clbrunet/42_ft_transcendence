    import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { ChannelStatus } from './enum.channelStatus';

import User  from '../user/user.entity';
import Participant from '../participant/participant.entity';

@Entity()
class Channel {
    @PrimaryGeneratedColumn('uuid')
    public id?: string;

    @Column({ unique: true })
    public name: string;

    @Column()
    public status: ChannelStatus;

    @Column({ nullable: true })
    public password: string;

    @ManyToOne(() => User, user => user.channels, { eager: false, onDelete: "CASCADE" })
    owner: User;

    @OneToMany(() => Participant, participant => participant.channel)
    participants: Participant[];
}

export default Channel;
