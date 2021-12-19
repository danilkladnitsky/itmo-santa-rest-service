import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationService {
  async sendOneNotification({ receiverId, message }) {
    try {
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/send`,
        { receiverId, message },
      );

      return res.data;
    } catch (err) {
      console.log(err);
      return err.response?.data;
    }
  }
  async sendNotification(notify) {
    const event = notify.event;
    const id = notify.receiverId;
    try {
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/${event || 'send'}`,
        { id },
      );

      return res.data;
    } catch (err) {
      console.log(err);
      return err.response?.data;
    }
  }

  async notifyOnGiftCreation({ id }: { id: string }) {
    try {
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/RECEIVER_ATTACHED`,
        { id },
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
        { id: creatorId },
      );
      const res = await axios.post(
        `${process.env.TELEGRAM_BOT_REST_URL}/notifications/${event || 'send'}`,
        { id: receiverId },
      );

      return res.data;
    } catch (err) {
      console.log(err);
      return err.response?.data;
    }
  }
}
