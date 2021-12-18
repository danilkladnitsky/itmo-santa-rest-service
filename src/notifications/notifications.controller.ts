import { Body, Controller, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { NotificationDTO } from 'src/items/dto/notification.request.dto';
import { NotificationService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send notification' })
  @ApiUnprocessableEntityResponse({ description: 'Validation errors' })
  async sendNotification(@Query() notification: NotificationDTO) {
    return await this.notificationService.sendNotification(notification);
  }

  @Post('sendInfo')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send notification' })
  @ApiUnprocessableEntityResponse({ description: 'Validation errors' })
  async sendInfo(@Body() notification: NotificationDTO) {
    return await this.notificationService.sendOneNotification(notification);
  }
}
