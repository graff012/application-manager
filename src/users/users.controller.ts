import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('branch/:branchId')
  findByBranch(@Param('branchId') branchId: string) {
    return this.usersService.findByBranch(branchId);
  }

  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // User self-update endpoint (must come before :id route)
  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Get('tabel/:tableNumber')
  findByTableNumber(@Param('tableNumber') tableNumber: string) {
    return this.usersService.findByTableNumber(tableNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  // Admin update endpoint
  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('count')
  @Roles('admin')
  getCountUsers() {
    return this.usersService.getCountUsers();
  }
}
