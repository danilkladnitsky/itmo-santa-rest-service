import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('/')
  async getRedirectParams(
    @Query('code') code: string,
    @Query('state') tg_id: string,
    @Res() resController,
  ) {
    if (!code || !tg_id) {
      await resController.redirect(
        'https://itmosanta.web.app/?status=invalid_data',
      );
      return;
    }
    return await this.authService.getAccessToken(code, tg_id, resController);
  }
}
