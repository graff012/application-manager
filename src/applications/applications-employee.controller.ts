import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { EmployeesService } from '../employees/employees.service';
import { PositionsService } from '../positions/positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('applications-employee')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsEmployeeController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly employeesService: EmployeesService,
    private readonly positionsService: PositionsService,
  ) {}

  @Get('assigned')
  @Roles('employee', 'admin')
  async getAssignedApplications(@Request() req) {
    const employeeId = req.user.userId;
    const employee = await this.employeesService.findOne(employeeId);
    return this.applicationsService.findByEmployee(employee._id);
  }

  @Patch(':id/assign')
  @Roles('employee', 'admin')
  async assignToSelf(@Param('id') id: string, @Request() req) {
    const employeeId = req.user.userId;
    const employee = await this.employeesService.findOne(employeeId);
    
    await this.employeesService.addAssignedApplication(employeeId, id);
    return this.applicationsService.assignToEmployee(id, employeeId, employee.fullName);
  }

  @Patch(':id/status')
  @Roles('employee', 'admin')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Request() req) {
    const employeeId = req.user.userId;
    const employee = await this.employeesService.findOne(employeeId);
    const position = await this.positionsService.findOne(employee.position.toString());

    // Check permission
    const permissionKey = `change_to_${dto.status}`;
    if (!position.permissions.includes(permissionKey) && req.user.role !== 'admin') {
      throw new Error(`You don't have permission to change status to ${dto.status}`);
    }

    return this.applicationsService.updateApplicationStatus(
      id,
      dto.status,
      employeeId,
      employee.fullName,
    );
  }
}
