import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import admin, { firestore } from 'firebase-admin';
import { AccountGuard } from './account.guard';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cloudflare } = require('../credentials/secrets.json');
import { Headers } from '@nestjs/common';

class PhotosDTO {
  limit?: number;
  page?: number;
  tags?: string[];
  uid?: string;
}

class CreatePhotosDTO {
  url: string;
  comment: string;
  tags: string;
}

class UpdatePhotoDTO {
  comment: string;
  tags: string[];
}

class CreateMomentDTO {
  title: string;
  photos: number[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('v1/imageReq')
  @UseGuards(AccountGuard)
  async requestImageUpload(): Promise<string> {
    const directUploadUrl = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflare.id}/images/v2/direct_upload`,
      null,
      { headers: { Authorization: `Bearer ${cloudflare.key}` } },
    );
    return directUploadUrl.data;
  }

  @Get('v1/photos')
  async getPhotos(@Query() photosDTO: PhotosDTO) {
    return this.appService.getPhotos(
      photosDTO.limit || 50,
      photosDTO.page || 0,
      photosDTO.tags || [],
      photosDTO.uid || null,
    );
  }

  @Get('v1/photo/:id')
  async getPhoto(@Param('id') id: number) {
    if (!id) {
      throw new HttpException('bad request', HttpStatus.BAD_REQUEST);
      return;
    }
    const photo = await this.appService.getPhotoById(id);
    if (!photo) {
      throw new HttpException('not found', HttpStatus.NOT_FOUND);
      return;
    }
    return photo;
  }

  @Post('v1/photo/:id')
  @UseGuards(AccountGuard)
  async updatePhoto(
    @Param('id') id: number,
    @Headers('token') token: string,
    @Body() updatePhoto: UpdatePhotoDTO,
  ) {
    const { uid } = await admin.auth().verifyIdToken(token);
    const photo = await this.appService.getPhotoById(id);
    if (photo.author !== uid) {
      throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
      return;
    }
    return this.appService.updatePhotoById(
      id,
      updatePhoto.comment,
      updatePhoto.tags,
    );
  }

  @Delete('v1/photo/:id')
  @UseGuards(AccountGuard)
  async deletePhoto(@Param('id') id: number, @Headers('token') token: string) {
    const { uid } = await admin.auth().verifyIdToken(token);
    const photo = await this.appService.getPhotoById(id);
    if (photo.author !== uid) {
      throw new HttpException('forbidden', HttpStatus.FORBIDDEN);
      return;
    }
    return this.appService.deletePhoto(id);
  }

  @Get('v1/tag/:id')
  async getPhotoByTag(@Param('id') id: string) {
    return this.appService.getPhotoByTag(id);
  }

  @Post('v1/user')
  @UseGuards(AccountGuard)
  async updateUserInfo(@Headers('token') token: string) {
    console.log('user data update');
    const user = await admin.auth().verifyIdToken(token);
    return await this.appService.updateUserInfo(
      user.user_id,
      user.firebase.identities['twitter.com'][0],
      user.name,
      user.picture,
    );
  }

  @Get('v1/user/:id')
  async getUserInfo(@Param('id') userId: string) {
    const user = await this.appService.getUserInfo(userId);
    const countInfo = await this.appService.getCountInfo(userId);
    return { user, countInfo };
  }

  @Get('v1/user/:id/moments')
  async getUserMomentData(@Param('id') userid) {
    return this.appService.getMomentByUserId(userid);
  }

  @Get('v1/user/:id/photos')
  async getUserPhotoData(@Param('id') userid) {
    return this.appService.getPhotoByUserId(userid);
  }

  @Post('v1/moment')
  @UseGuards(AccountGuard)
  async createMoment(
    @Headers('token') token: string,
    @Body() moment: CreateMomentDTO,
  ) {
    const data = await admin.auth().verifyIdToken(token);
    return this.appService.createMomentUseByPhotoId(
      data.uid,
      moment.title,
      moment.photos,
    );
  }

  @Get('/v1/moment/:id')
  async getMoment(@Param('id') momentId: number) {
    return this.appService.getMomentById(momentId);
  }

  @Post('v1/photo')
  @UseGuards(AccountGuard)
  async addPhoto(
    @Headers('token') token: string,
    @Query() create: CreatePhotosDTO,
  ) {
    const data = await admin.auth().verifyIdToken(token);
    return this.appService.addPhoto(
      create.url,
      create.comment,
      data.uid,
      JSON.parse(create.tags),
    );
  }
}
