import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

const jwt = require('jsonwebtoken');

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('/')
  async getRedirectParams(
    @Query('code') code: string,
    @Query('state') token: string,
    @Res() resController,
  ) {
    const safe_page = 'https://itmosanta.web.app/?status';
    if (!code || !token) {
      await resController.redirect(`${safe_page}=invalid_data`);
      return;
    }

    const telegram_data = await this.decodeToken(token);
    if (telegram_data.type === 'error') {
      await resController.redirect(`${safe_page}=${telegram_data.status}`);
      return;
    }

    const access_token = await this.authService.getAccessToken(
      code,
      telegram_data.tg_id,
    );

    const status = await this.authService.saveUserInfo(
      access_token,
      telegram_data.tg_id,
    );

    console.log(
      'INFO',
      `Пользователь был перенаправлен на ${safe_page}=${status}`,
    );
    await resController.redirect(`${safe_page}=${status}`);
  }

  async decodeToken(token: string) {
    try {
      const data = jwt.verify(token, process.env.JWT_AUTH_SECRET);

      return data;
    } catch (err) {
      console.log('ERROR', `Токен авторизации не прошёл проверку`);
      return {
        type: 'error',
        status: 'invalid_data',
      };
    }
  }
}
