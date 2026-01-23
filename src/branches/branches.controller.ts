import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBranchDto } from './dto/create-branch.dto';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@ApiTags('branches')
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  // @Roles('admin')
  @RequirePermission('branches', 'create')
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  @RequirePermission('branches', 'read')
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.branchesService.findAll({ status, search });
  }

  @Get(':id')
  @RequirePermission('branches', 'read')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @RequirePermission('branches', 'update')
  update(@Param('id') id: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @RequirePermission('branches', 'delete')
  delete(@Param('id') id: string) {
    return this.branchesService.delete(id);
  }
}
