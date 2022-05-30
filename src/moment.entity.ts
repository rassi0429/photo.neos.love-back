import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
@Unique(['id'])
export class Moment {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @ManyToMany(() => Photo)
  @JoinTable()
  photos: Photo[];
}
