import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(@Body() dto: CreateInventoryDto, @UploadedFiles() files: any[]) {
    const urls = (files || []).map((f: any) => f.location).filter(Boolean);
    return this.inventoryService.create(dto, urls);
  }

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @UploadedFiles() files: any[],
  ) {
    const urls = (files || []).map((f: any) => f.location).filter(Boolean);
    return this.inventoryService.update(id, dto, urls.length ? urls : undefined);
  }
}
