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
      throw new NotFoundException({ message: 'Подарок не найден' });
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
      this.handleGiftNotification(result, 'GIFT_DELIVERED');
    }

    if (update.status && update.status === 'RECEIVED') {
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

  async handleGiftNotification(gift, event) {
    const notify = {
      id: gift.receiverId,
      event,
    };
    const res = await this.notificationService.sendNotification(notify);
    return res;
  }

  async handleGiftCreationNotification(gift) {
    const notify = {
      id: gift.creatorId,
    };

    const res = await this.notificationService.notifyOnGiftCreation(notify);
    return res;
  }

  async handleGiftReceive(gift) {
    const notifyReceiver = {
      id: gift.receiverId,
      event: 'GIFT_RECEIVED',
    };

    const notifyCreator = {
      id: gift.creatorId,
      event: 'GIFT_WAS_TAKEN',
    };

    const resReceiver = await this.notificationService.sendNotification(
      notifyReceiver,
    );
    const resCreator = await this.notificationService.sendNotification(
      notifyCreator,
    );
    return [resReceiver, resCreator];
  }
}
