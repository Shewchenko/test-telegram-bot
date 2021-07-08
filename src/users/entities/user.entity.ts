import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { IUser } from '../contracts/iUser';

@Entity('users')
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'tg_id', nullable: false, unique: true, type: 'integer' })
  tgId: number;
}
