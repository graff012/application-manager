import { Body, Controller, Get, Post, Patch, Delete, Param  } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateBranchDto } from './dto/create-branch.dto';
import { BranchesService } from './branches.service';

@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.branchesService.delete(id);
  }
}
