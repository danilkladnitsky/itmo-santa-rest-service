import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import axios from 'axios';
import { TelegramUserGuard } from 'src/common/TelegramUserGuard';
import { MultipleEntities } from 'src/items/dto/multipleEntities.request.dto';
import { UserDTO } from 'src/items/dto/user.request.dto';
import { UserUpdateDTO } from 'src/items/dto/user.update.dto';
import { ICommonUser } from 'src/items/interfaces/CommonUser';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@Injectable()
//@UseGuards(TelegramUserGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // create user
  @Post('create')
  @ApiBearerAuth()
  async createUser(@Query() user: UserDTO) {
    const id = await this.usersService.createUser(user);
    return id;
  }

  // get all users
  @Get('/')
  @ApiBearerAuth()
  async getUsers(@Query() data: MultipleEntities) {
    return await this.usersService.getUsers(data.limit, data.offset);
  }

  // get users with the same properties value
  @Get('getBy/:property/:value')
  @ApiBearerAuth()
  async getUser(
    @Param('property') property: string,
    @Param('value') value: string,
  ) {
    return await this.usersService.getUser(property, value);
  }

  // get user by tg id
  @Get('get/:tg_id/')
  @ApiBearerAuth()
  async getUserByTg(@Param('tg_id') value: string) {
    return await this.usersService.getUser('tg_id', value);
  }

  // updating user bio
  @Patch('update/:tg_id')
  @ApiBearerAuth()
  async updateUser(
    @Param('tg_id') id: string,
    @Body() data: UserUpdateDTO,
  ): Promise<ICommonUser> {
    return await this.usersService.updateUser(id, data);
  }

  // auth user isu
  @Get('auth/:tg_id')
  @ApiBearerAuth()
  async authUser(@Param('tg_id') id: string): Promise<boolean> {
    await axios.post(
      `${process.env.TELEGRAM_BOT_REST_URL}/notifications/registration`,
      { receiverId: id },
    );
    return true;
  }

  @Delete('remove/:tg_id')
  @ApiBearerAuth()
  async removeUser(@Param('tg_id') id: string): Promise<ICommonUser> {
    return await this.usersService.removeUser(id);
  }
}
