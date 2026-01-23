import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { RequirePermission } from 'src/auth/decorators/permissions.decorator';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('inventory')
export class InventoryController {
  private readonly qrCodeDir = path.join(process.cwd(), 'public', 'qrcodes');

  constructor(private readonly inventoryService: InventoryService) {
    if (!fs.existsSync(this.qrCodeDir)) {
      fs.mkdirSync(this.qrCodeDir, { recursive: true });
    }
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @RequirePermission('invetories', 'create')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() dto: CreateInventoryDto,
    @UploadedFiles() files: any[],
    @Request() req,
  ) {
    const urls = (files || [])
      .map((f: any) => this.toUploadsUrlPath(f?.path))
      .filter(Boolean);
    const employeeId =
      req.user?.role === 'employee' || req.user?.role === 'admin'
        ? req.user.userId
        : undefined;
    return this.inventoryService.create(dto, urls, employeeId);
  }

  @Get()
  @RequirePermission('invetories', 'read')
  findAll(
    @Query('status') status?: string,
    @Query('branch') branch?: string,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAll({ status, branch, search });
  }

  @Get(':id/repair-history')
  @RequirePermission('inventories', 'read')
  getRepairHistory(@Param('id') id: string) {
    return this.inventoryService.getRepairHistory(id);
  }

  @Get(':id')
  @RequirePermission('invetories', 'read')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('invetories', 'update')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @UploadedFiles() files: any[],
    @Request() req,
  ) {
    const urls = (files || [])
      .map((f: any) => this.toUploadsUrlPath(f?.path))
      .filter(Boolean);
    const employeeId =
      req.user?.role === 'employee' || req.user?.role === 'admin'
        ? req.user.userId
        : undefined;
    return this.inventoryService.update(
      id,
      dto,
      urls.length ? urls : undefined,
      employeeId,
    );
  }

  @Get('qr/:inventoryNumber')
  @RequirePermission('invetories', 'read')
  @ApiTags('QR Code')
  async getByQrCode(@Param('inventoryNumber') inventoryNumber: string) {
    return this.inventoryService.findByInventoryNumber(inventoryNumber);
  }

  @Get('qrcode/:inventoryNumber/download')
  @RequirePermission('invetories', 'read')
  @ApiTags('QR Code')
  async downloadQrCode(
    @Param('inventoryNumber') inventoryNumber: string,
    @Res() res: Response,
  ) {
    const inventory =
      await this.inventoryService.findByInventoryNumber(inventoryNumber);
    if (!inventory || !inventory.qrCodeUrl) {
      throw new NotFoundException('QR code not found');
    }

    const filePath = path.join(process.cwd(), 'public', inventory.qrCodeUrl);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('QR code file not found');
    }

    const fileName = `inventory-${inventoryNumber}-qrcode.png`;
    res.download(filePath, fileName);
  }

  private toUploadsUrlPath(filePath?: string): string {
    if (!filePath) {
      return '';
    }

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
