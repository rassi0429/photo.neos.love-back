import {
  Controller,
  Get,
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
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('imageReq')
  @UseGuards(AccountGuard)
  async requestImageUpload(): Promise<string> {
    const directUploadUrl = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${cloudflare.id}/images/v2/direct_upload`,
      null,
      { headers: { Authorization: `Bearer ${cloudflare.key}` } },
    );
    return directUploadUrl.data;
  }

  @Get('photos')
  async getPhotos(@Query() photosDTO: PhotosDTO) {
    return this.appService.getPhotos(
      photosDTO.limit || 50,
      photosDTO.page || 0,
      photosDTO.tags || [],
      photosDTO.uid || null,
    );
  }

  @Post('photo')
  @UseGuards(AccountGuard)
  async addPhoto(
    @Headers('token') token: string,
    @Query() create: CreatePhotosDTO,
  ) {
    const data = await admin.auth().verifyIdToken(token);
    return this.appService.addPhoto(create.url, 'hage', data.uid, []);
  }

  @Get('')
  async test() {
    this.appService.test();
  }
}
