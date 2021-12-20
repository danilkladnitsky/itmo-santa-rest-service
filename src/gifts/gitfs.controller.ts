import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TelegramElfGuard } from 'src/common/TelegramElfGuard';
import { GiftDTO } from 'src/items/dto/gift.request.dto';
import { GiftUpdateDTO } from 'src/items/dto/gift.update.dto';
import { MultipleEntities } from 'src/items/dto/multipleEntities.request.dto';
import { ICommonGift } from 'src/items/interfaces/CommonGift';
import { GiftsService } from './gitfs.service';

@ApiTags('gifts')
@Controller('gifts')
// @UseGuards(TelegramElfGuard)
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Post('create')
  @ApiBearerAuth()
  async createGift(@Query() gift: GiftDTO): Promise<ICommonGift> {
    const res = await this.giftsService.createGift(gift);
    return res;
  }

  @Patch('update/:tg_id')
  @ApiBearerAuth()
  async updateGift(
    @Param('tg_id') id: string,
    @Query() data: GiftUpdateDTO,
  ): Promise<ICommonGift> {
    return await this.giftsService.updateGift(id, data);
  }

  @Get('/')
  @ApiBearerAuth()
  async getGifts(@Query() data: MultipleEntities) {
    return await this.giftsService.getGifts(data.limit, data.offset);
  }

  @Get('getBy/:property/:value')
  @ApiBearerAuth()
  async getGift(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.giftsService.getGift(property, value);
  }

  @Delete('remove/:tg_id')
  @ApiBearerAuth()
  async removeGift(@Param('tg_id') id: string): Promise<ICommonGift> {
    return await this.giftsService.removeGift(id);
  }

  @UseGuards(TelegramElfGuard)
  @Patch('updateByCode/:giftCode/:status')
  async updateGiftByCode(
    @Param('giftCode') giftCode: number,
    @Param('status') status: string,
  ) {
    return await this.giftsService.updateGiftByCode(giftCode, status);
  }
}
