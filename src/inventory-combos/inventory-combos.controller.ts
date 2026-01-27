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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';
import { InventoryCombosService } from './inventory-combos.service';
import { CreateInventoryComboDto } from './dto/create-inventory-combo.dto';
import { UpdateInventoryComboDto } from './dto/update-inventory-combo.dto';

@ApiTags('inventory-combos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('inventory-combos')
export class InventoryCombosController {
  constructor(private readonly combosService: InventoryCombosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @RequirePermission('inventories', 'create')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() dto: CreateInventoryComboDto,
    @UploadedFile() file?: Multer.File,
    @Request() req?,
  ) {
    const imageUrl = file?.path ? this.toUploadsUrlPath(file.path) : undefined;
    return this.combosService.create(dto, imageUrl, req?.user?.userId);
  }

  @Get()
  @RequirePermission('inventories', 'read')
  findAll(@Query('status') status?: string, @Query('search') search?: string) {
    return this.combosService.findAll({ status, search });
  }

  @Get(':id')
  @RequirePermission('inventories', 'read')
  findOne(@Param('id') id: string) {
    return this.combosService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @RequirePermission('inventories', 'update')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryComboDto,
    @UploadedFile() file?: Multer.File,
  ) {
    const imageUrl = file?.path ? this.toUploadsUrlPath(file.path) : undefined;
    return this.combosService.update(id, dto, imageUrl);
  }

  @Delete(':id')
  @RequirePermission('inventories', 'delete')
  remove(@Param('id') id: string) {
    return this.combosService.remove(id);
  }

  private toUploadsUrlPath(filePath?: string): string {
    if (!filePath) return '';

    const normalized = String(filePath)
      .replace(/\\/g, '/')
      .replace(/^(\.\.\/)+/g, '')
      .replace(/^\.?\//g, '');

    const uploadsIndex = normalized.indexOf('uploads/');
    const relativePath =
      uploadsIndex >= 0 ? normalized.slice(uploadsIndex) : normalized;

    return `/${relativePath}`;
  }
}
