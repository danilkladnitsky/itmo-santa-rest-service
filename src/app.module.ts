import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AppService } from './app.service';
import { GiftsModule } from './gifts/gitfs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';

const { MODE, DEV_MONGODB_URL, PROD_MONGODB_URL } = process.env;

@Module({
  imports: [
    UsersModule,
    GiftsModule,
    NotificationsModule,
    AuthModule,
    MongooseModule.forRoot(MODE === 'DEV' ? DEV_MONGODB_URL : PROD_MONGODB_URL),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
