import { ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async getAccessToken(code, tg_id, resController) {
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

      return await this.getUserData(access_token, tg_id, res);
    } catch (err) {
      console.log(err);
      resController.redirect('https://itmosanta.web.app/?status=error');
    }
  }

  async getUserData(token, tg_id, resController) {
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
        resController.redirect('https://itmosanta.web.app/?status=success');
      } catch (ConflictException) {
        resController.redirect(
          'https://itmosanta.web.app/?status=already_registered',
        );
      }
    } catch (err) {
      console.log(err);
      resController.redirect('https://itmosanta.web.app/?status=error');
      throw new ForbiddenException(
        { type: 'error', message: 'Invalid user token' },
        'Invalid user token',
      );
    }
  }
}
