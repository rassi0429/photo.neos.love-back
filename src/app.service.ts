import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './photo.entity';
import { Moment } from './moment.entity';
import { Tag } from './tag.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Moment)
    private momentRepository: Repository<Moment>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async test() {
    const testPhoto = await this.addPhoto('hage', 'hoge', 'kokoa', [
      'hoge',
      'hage',
      'hamage',
    ]);
    const testMoment = new Moment();
    testMoment.photos = [testPhoto];
    testMoment.author = '123';
    testMoment.title = 'kyo no moments';

    await this.momentRepository.save(testMoment);

    return;
  }

  async getPhotos(limit: number, page: number, tags: string[], user: string) {
    let photos = [];
    if (tags.length !== 0) {
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        where: {
          tags: In(
            tags.map((t) => {
              return {
                name: t,
              };
            }),
          ),
        },
        relations: ['tags'],
      });
    } else if (user) {
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        where: {
          author: user,
        },
        relations: ['tags'],
      });
    } else {
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        relations: ['tags'],
      });
    }
    return photos;
  }

  async addPhoto(url: string, comment: string, author: string, tags: string[]) {
    const newPhoto = new Photo();
    newPhoto.url = url;
    newPhoto.comment = comment;
    newPhoto.author = author;
    newPhoto.tags = [];
    for (const item of tags) {
      const t = await this.tagRepository.findOne({ name: item });
      if (t) {
        newPhoto.tags.push(t);
      } else {
        const newTag = new Tag();
        newTag.name = item;
        const tag = await this.tagRepository.save(newTag);
        newPhoto.tags.push(tag);
      }
    }
    return this.photoRepository.save(newPhoto);
  }

  async createMoment(title: string, author: string, photo: Photo[]) {
    const newMoment = new Moment();
    newMoment.title = title;
    newMoment.author = author;
    newMoment.photos = [...photo];
    return this.momentRepository.save(newMoment);
  }
}
