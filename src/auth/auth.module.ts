import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/items/model/user.model';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NotificationService } from 'src/notifications/notifications.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, NotificationService],
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
})
export class AuthModule {}
