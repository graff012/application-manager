import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';
import { DeductToolDto } from './dto/deduct-tool.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@ApiTags('tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  @RequirePermission('tools', 'create')
  create(@Body() dto: CreateToolDto) {
    return this.toolsService.create(dto);
  }

  @Get()
  @RequirePermission('tools', 'read')
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.toolsService.findAll({ status, search });
  }

  @Get(':id')
  @RequirePermission('tools', 'read')
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  @Get(':id/count')
  @RequirePermission('tools', 'read')
  count(@Param('id') id: string) {
    return this.toolsService.countOne(id);
  }


  @Get('tag/:tagId')
  @RequirePermission('tools', 'read')
  findByTag(@Param('tagId') tagId: string) {
    return this.toolsService.findByTag(tagId);
  }

  @Get('tag/:tagId/count')
  @RequirePermission('tools', 'read')
  countByTag(@Param('tagId') tagId: string) {
    return this.toolsService.countByTag(tagId);
  }

  @Patch(':id')
  @RequirePermission('tools', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateToolDto) {
    return this.toolsService.update(id, dto);
  }

  @Patch(':id/deduction')
  @RequirePermission('tools', 'update')
  deduct(
    @Param('id') id: string,
    @Body() dto: DeductToolDto,
    @Request() req,
  ) {
    const actorId =
      req.user?.role === 'employee' || req.user?.role === 'admin'
        ? req.user.userId
        : undefined;
    const actorModel = req.user?.role === 'admin' ? 'Admin' : 'Employee';

    return this.toolsService.deduct(
      id,
      dto,
      actorId ? { id: actorId, model: actorModel } : undefined,
    );
  }

  @Delete(':id')
  @RequirePermission('tools', 'delete')
  remove(@Param('id') id: string) {
    return this.toolsService.remove(id);
  }
}
