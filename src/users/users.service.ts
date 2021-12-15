import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MAX_USERS_PER_REQUEST } from 'src/const/api';
import { GiftsService } from 'src/gifts/gitfs.service';
import { UserDTO } from 'src/items/dto/user.request.dto';
import { ICommonUser } from 'src/items/interfaces/CommonUser';
import { NotificationService } from 'src/notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<ICommonUser>,
    private readonly notificationService: NotificationService,
  ) {}

  async createUser(user: UserDTO) {
    let thisUser;

    try {
      thisUser = await this.getUser('tg_id', user.tg_id);
    } catch (err) {}
    const ifUserExist = Boolean(thisUser);
    if (ifUserExist) {
      throw new ConflictException({
        description:
          'Данный пользователь уже был зарегистрирован / User was already registered',
      });
    }

    const newUser = new this.userModel({ ...user });

    await this.handleUserCreate(user.tg_id);
    await newUser.save();
    return 'Вы зарегистрировались! Сейчас вам придёт сообщение от бота в Телеграме. Your registration was successful! Now you will receive the message from bot with new information.';
  }

  async handleUserCreate(receiverId: string) {
    const notify = {
      receiverId: receiverId,
      event: 'REGISTRATION',
    };

    const res = await this.notificationService.sendNotification(notify);
    return res;
  }

  async getUsers(limit = MAX_USERS_PER_REQUEST, offset = 0) {
    const result = await this.userModel
      .find()
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();

    return {
      users: result,
      count: await this.userModel.countDocuments().exec(),
    };
  }

  async getUser(property: string, value: string) {
    if (property === 'id') {
      property = '_id';
    }

    const result = await this.userModel.findOne({ [property]: value });

    if (!result) {
      throw new NotFoundException({ message: 'Пользователь не найден' });
    }

    return result;
  }

  async updateUser(id: string, update): Promise<ICommonUser> {
    const result = await this.userModel.findOneAndUpdate(
      { tg_id: id },
      update,
      {
        lean: true,
        returnOriginal: false,
      },
    );

    if (!result) {
      throw new NotFoundException({ message: 'Данный пользователь не найден' });
    }

    return result;
  }

  async removeUser(id: string): Promise<ICommonUser> {
    let result: ICommonUser;
    try {
      result = await this.userModel.findOneAndDelete({ tg_id: id });
    } catch (err) {
      console.log(err);
      throw new ConflictException({
        description: 'Ошибка базы данных. Скорее всего id задан неверно.',
      });
    }

    if (!result) {
      throw new NotFoundException({ message: 'Данный пользователь не найден' });
    }

    return result;
  }
}
