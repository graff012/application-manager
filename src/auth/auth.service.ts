import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AdminsService } from '../admins/admins.service';
import { EmployeesService } from '../employees/employees.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminsService: AdminsService,
    private employeesService: EmployeesService,
    private jwtService: JwtService,
  ) {}

  async login(tableNumber: number, jshshir: string) {
    const user = await this.usersService.findByTableNumberAndPassport(
      tableNumber,
      jshshir,
    );
    if (!user)
      throw new UnauthorizedException(
        'Table number or passport number is incorrect',
      );

    if (user.status === 'blocked') {
      throw new UnauthorizedException('User is blocked');
    }

    const payload = { sub: user._id.toString(), tableNumber: user.tableNumber };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async adminLogin(email: string, password: string) {
    // Try admin first
    const admin = await this.adminsService.findByEmail(email);
    if (admin) {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid)
        throw new UnauthorizedException('Email or password is incorrect');

      const payload = {
        userId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
        userId: admin._id.toString(),
        role: admin.role,
      };
    }

    // If no admin, try employee
    const employee = await this.employeesService.findByEmail(email);
    if (!employee)
      throw new UnauthorizedException('Email or password is incorrect');

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Email or password is incorrect');

    const payload = {
      userId: employee._id.toString(),
      email: employee.email,
      role: employee.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      userId: employee._id.toString(),
      role: employee.role,
    };
  }
}
