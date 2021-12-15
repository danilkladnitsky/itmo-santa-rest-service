import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async getAccessToken(code, tg_id) {
    try {
      const { CLIENT_ID, CLIENT_SECRET, GRANT_TYPE, REDIRECT_URI } =
        process.env;
      const data = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: GRANT_TYPE,
        redirect_uri: REDIRECT_URI,
        code,
      };

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        Host: 'login.itmo.ru',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
      };

      const morphData = Object.keys(data)
        .map((key) => `${key}=${encodeURIComponent(data[key])}`)
        .join('&');

      const res = await axios.post(
        'https://login.itmo.ru/auth/realms/itmo/protocol/openid-connect/token',
        morphData,
        {
          headers,
        },
      );

      const { access_token } = res.data;

      return access_token;
    } catch (err) {
      console.log('ERROR', `${tg_id} не смог получить токен авторизации в ИСУ`);
      console.log(err);
      return 'error';
    }
  }

  async saveUserInfo(token, tg_id, language_code) {
    try {
      const headers = {
        Accept: '*/*',
        Host: 'login.itmo.ru',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        Authorization: `Bearer ${token}`,
      };

      const res = await axios.get(
        'https://login.itmo.ru/auth/realms/itmo/protocol/openid-connect/userinfo',
        {
          headers,
        },
      );

      const { isu, name, email } = res.data;
      const userEntity = { tg_id, isu, name, email, language_code };

      try {
        await this.usersService.createUser(userEntity);
        console.log('SUCCESS', `${userEntity.name} зарегистрировался`);

        return 'success';
      } catch (ConflictException) {
        console.log(
          'WARNING',
          `${userEntity.name} попытался во второй раз зарегаться`,
        );
        return 'already_registered';
      }
    } catch (err) {
      console.log('ERROR', `Ошибка с получением данных пользователя ${tg_id}`);
      console.log(err);
      return 'error';
    }
  }
}
