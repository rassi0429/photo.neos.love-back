import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
@Entity()
@Unique(['id'])
export class UserInfo {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  uid: string;

  @Column({ type: 'text' })
  name: string;

  @Column()
  twitterId: string;

  @Column({ type: 'text' })
  twitterImage: string;
}
