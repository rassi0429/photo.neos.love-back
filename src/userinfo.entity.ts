import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
@Entity()
@Unique(['id'])
export class UserInfo {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  uid: string;

  @Column()
  name: string;

  @Column()
  twitterId: string;

  @Column()
  twitterImage: string;
}
