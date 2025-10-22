import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsService } from './departments.service';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }
}
