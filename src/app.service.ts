import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './photo.entity';
import { Moment } from './moment.entity';
import { Tag } from './tag.entity';
import { UserInfo } from './userinfo.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Photo)
    private photoRepository: Repository<Photo>,
    @InjectRepository(Moment)
    private momentRepository: Repository<Moment>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
  ) {}

  async getMomentByUserId(uid: string) {
    console.log('getMomentByUserId', uid);
    return this.momentRepository.find({
      where: { author: uid },
      relations: ['photos'],
      order: {
        id: 'DESC',
      },
    });
  }

  async getPhotoByUserId(uid: string) {
    console.log('getPhotoByUserId', uid);
    return this.photoRepository.find({
      where: { author: uid },
      relations: ['tags'],
      order: {
        id: 'DESC',
      },
    });
  }

  async getPhotoById(id: number) {
    return this.photoRepository.findOne({
      where: {
        id,
      },
      relations: ['tags'],
    });
  }

  async getCountInfo(uid: string) {
    const photo = await this.photoRepository.count({ where: { author: uid } });
    const moment = await this.momentRepository.count({
      where: { author: uid },
    });
    return { photo, moment };
  }

  async createMomentUseByPhotoId(
    uid: string,
    title: string,
    photoIds: number[],
  ) {
    const photos: Photo[] = [];
    for (const item of photoIds) {
      const photo = await this.photoRepository.findOne({ where: { id: item } });
      if (photo) photos.push(photo);
    }
    const moment = new Moment();
    moment.title = title;
    moment.author = uid;
    moment.photos = photos;
    moment.createDate = new Date();
    return await this.momentRepository.save(moment);
  }

  async getMomentById(momentId: number) {
    return this.momentRepository.findOne({
      where: { id: momentId },
      relations: ['photos', 'photos.tags'],
    });
  }

  async getPhotoByTag(tag: string) {
    return this.tagRepository.findOne({
      where: { name: tag },
      relations: [`photos`, `photos.tags`],
    });
  }

  async updatePhotoById(id, comment, tags) {
    const photo = await this.photoRepository.findOne({ where: { id } });
    const newTags = [];
    for (const item of tags) {
      const t = await this.tagRepository.findOne({ name: item });
      if (t) {
        newTags.push(t);
      } else {
        const newTag = new Tag();
        newTag.name = item;
        const tag = await this.tagRepository.save(newTag);
        newTags.push(tag);
      }
    }
    photo.comment = comment;
    photo.tags = newTags;
    return this.photoRepository.save(photo);
  }

  async getPhotos(limit: number, page: number, tags: string[], user: string) {
    let photos = [];
    if (tags.length !== 0) {
      console.log('tag');
      const tag = this.tagRepository.findOne({ where: { name: 'NULL' } });
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        where: { tags: In([tag]) },
        relations: ['tags'],
        order: {
          id: 'DESC',
        },
      });
    } else if (user) {
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        where: {
          author: user,
        },
        relations: ['tags'],
        order: {
          id: 'DESC',
        },
      });
    } else {
      photos = await this.photoRepository.find({
        take: limit,
        skip: limit * page,
        relations: ['tags'],
        order: {
          id: 'DESC',
        },
      });
    }
    return photos;
  }

  async addPhoto(url: string, comment: string, author: string, tags: string[]) {
    const newPhoto = new Photo();
    newPhoto.url = url;
    newPhoto.comment = comment;
    newPhoto.author = author;
    newPhoto.createDate = new Date();
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

  async deletePhoto(id: number) {
    const photo = await this.photoRepository.findOne({ where: { id } });
    return this.photoRepository.remove(photo);
  }

  async createMoment(title: string, author: string, photo: Photo[]) {
    const newMoment = new Moment();
    newMoment.title = title;
    newMoment.author = author;
    newMoment.photos = [...photo];
    return this.momentRepository.save(newMoment);
  }

  async updateUserInfo(uid, twitterId, name, iconUrl) {
    let user = await this.userInfoRepository.findOne({ where: { uid } });
    if (!user) user = new UserInfo();
    user.uid = uid;
    user.twitterId = twitterId;
    user.name = name;
    user.twitterImage = iconUrl;
    return this.userInfoRepository.save(user);
  }

  async getUserInfo(uid) {
    return this.userInfoRepository.findOne({ where: { uid } });
  }
}
