import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { GiftsModule } from './gifts/gitfs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

const { MONGODB_URL } = process.env;

@Module({
  imports: [
    UsersModule,
    GiftsModule,
    NotificationsModule,
    AuthModule,
    MongooseModule.forRoot(MONGODB_URL),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
