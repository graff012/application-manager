import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async login(tableNumber: number) {
    const user = await this.usersService.findByTableNumber(tableNumber);
    if (!user) throw new UnauthorizedException();
    const payload = { sub: user.id, tableNumber: user.tableNumber };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
