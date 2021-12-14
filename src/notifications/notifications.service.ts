import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  async sendNotification({
    receiverId,
    event,
  }: {
    receiverId: string;
    event: string;
  }) {
    try {
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/${event || 'send'}`,
        { receiverId },
      );

      return res.data;
    } catch (err) {
      console.log(err);
      return err.response?.data;
    }
  }

  async sendPairNotification({
    receiverId,
    creatorId,
    event,
  }: {
    receiverId: string;
    creatorId: string;
    event: string;
  }) {
    try {
      await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/${event || 'send'}`,
        { receiverId: creatorId },
      );
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/${event || 'send'}`,
        { receiverId },
      );

      return res.data;
    } catch (err) {
      console.log(err);
      return err.response?.data;
    }
  }
}
