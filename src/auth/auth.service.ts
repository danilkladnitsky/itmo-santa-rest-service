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

      return await this.getUserData(access_token, tg_id);
    } catch (err) {
      console.log(err);
      return 'error';
    }
  }

  async getUserData(token, tg_id) {
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
      const userEntity = { tg_id, isu, name, email };

      try {
        await this.usersService.createUser(userEntity);
        return 'success';
      } catch (ConflictException) {
        return 'already_registered';
      }
    } catch (err) {
      console.log(err);
      return 'error';
    }
  }
}
