import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftsService } from 'src/gifts/gitfs.service';
import { NotificationService } from 'src/notifications/notifications.service';
import { UserSchema } from '../items/model/user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, NotificationService],
})
export class UsersModule {}
