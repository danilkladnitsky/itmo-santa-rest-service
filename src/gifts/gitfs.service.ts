import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MAX_GIFTS_PER_REQUEST } from 'src/const/api';
import { ICommonGift } from 'src/items/interfaces/CommonGift';
import { NotificationService } from 'src/notifications/notifications.service';

@Injectable()
export class GiftsService {
  constructor(
    @InjectModel('Gift') private readonly giftModel: Model<ICommonGift>,
    private readonly notificationService: NotificationService,
  ) {}

  async createGift(gift: ICommonGift) {
    if (!gift.status) {
      gift.status = 'pending';
    }

    const lastGift = await this.giftModel
      .find()
      .limit(1)
      .sort({ $natural: -1 });

    let lastGiftCode = (lastGift as unknown as ICommonGift)[0]?.giftCode;

    if (!lastGiftCode) {
      lastGiftCode = 100000;
    }

    lastGiftCode = lastGiftCode + 1;

    const newGift = new this.giftModel({
      ...gift,
      giftCode: lastGiftCode,
    });

    const res = await newGift.save();

    await this.handleGiftCreationNotification(newGift);
    return res;
  }

  async getGifts(limit = MAX_GIFTS_PER_REQUEST, offset = 0) {
    const result = await this.giftModel
      .find()
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();

    return {
      users: result,
      count: await this.giftModel.countDocuments().exec(),
    };
  }

  async getGift(property: string, value: string) {
    if (property === 'id') {
      property = '_id';
    }

    const result = await this.giftModel.findOne({ [property]: value });

    if (!result) {
      throw new NotFoundException('no letter was attached');
    }

    return result;
  }

  async updateGift(id: string, update): Promise<ICommonGift> {
    const result = await this.giftModel.findOneAndUpdate(
      { creatorId: id },
      update,
      {
        lean: true,
        new: true,
      },
    );

    if (!result) {
      throw new NotFoundException({ message: 'Подарок не найден' });
    }

    if (update.status && update.status === 'DELIVERED') {
      this.handleGiftDeliverNotification(result);
    }

    if (update.status && update.status === 'RECEIVED') {
      this.handleGiftReceive(result);
    }

    return result;
  }

  async updateGiftByCode(giftCode: number, status: string) {
    const result = await this.giftModel.findOneAndUpdate(
      { giftCode },
      { status },
      { lean: true, returnOriginal: false },
    );

    if (status === 'DELIVERED') {
      this.handleGiftDeliverNotification(result);
    }

    if (status === 'RECEIVED') {
      this.handleGiftReceive(result);
    }

    return result;
  }

  async removeGift(id: string): Promise<ICommonGift> {
    const result = await this.giftModel.findOneAndDelete({ tg_id: id });

    if (!result) {
      throw new NotFoundException({ message: 'Подарок не найден' });
    }

    return result;
  }

  async handleGiftDeliverNotification(gift) {
    console.log(gift);

    const notifyGiftCreator = {
      receiverId: gift.creatorId,
      event: 'MY_GIFT_DELIVERED',
    };
    const notifyGiftReceiver = {
      receiverId: gift.receiverId,
      event: 'GIFT_DELIVERED',
    };
    await this.notificationService.sendNotification(notifyGiftCreator);
    await this.notificationService.sendNotification(notifyGiftReceiver);
    return { status: 'ok' };
  }

  async handleGiftCreationNotification(gift) {
    const notify = {
      id: gift.creatorId,
    };

    const res = await this.notificationService.notifyOnGiftCreation(notify);
    return res;
  }

  async handleGiftReceive(gift) {
    const notifyGiftCreator = {
      receiverId: gift.creatorId,
      event: 'MY_GIFT_RECEIVED',
    };

    const notifyGiftReceiver = {
      receiverId: gift.receiverId,
      event: 'GIFT_RECEIVED',
    };

    const resReceiver = await this.notificationService.sendNotification(
      notifyGiftCreator,
    );
    const resCreator = await this.notificationService.sendNotification(
      notifyGiftReceiver,
    );
    return [resReceiver, resCreator];
  }
}
