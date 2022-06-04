import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @ManyToMany((type) => Photo, (photo) => photo.tags)
  photos: Photo[];
}
