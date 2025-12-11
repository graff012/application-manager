import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@ApiTags('departments')
@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermission('departments', 'create')
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Get()
  @RequirePermission('departments', 'read')
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('branch/:branchId')
  @RequirePermission('departments', 'read')
  findByBranch(@Param('branchId') branchId: string) {
    return this.departmentsService.findByBranch(branchId);
  }

  @Get(':id')
  @RequirePermission('departments', 'read')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('departments', 'update')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: CreateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('departments', 'delete')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.departmentsService.delete(id);
  }
}
