import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminsService: AdminsService,
    private jwtService: JwtService,
  ) {}

  async login(tableNumber: number) {
    const user = await this.usersService.findByTableNumber(tableNumber);
    if (!user) throw new UnauthorizedException();
    const payload = { sub: user.id, tableNumber: user.tableNumber };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async adminLogin(email: string, password: string) {
    const admin = await this.adminsService.findByEmail(email);
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { userId: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      userId: admin.id,
      role: admin.role,
    };
  }
}
