import { Body, Controller, Get, Post } from '@nestjs/common';
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
}
