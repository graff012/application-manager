import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { EmployeesService } from '../employees/employees.service';
import { AdminsService } from '../admins/admins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { ExtendDeadlineDto } from './dto/extend-deadline.dto';
import { CompleteApplicationDto } from './dto/complete-application.dto';

@ApiTags('applications-employee')
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationsEmployeeController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly employeesService: EmployeesService,
    private readonly adminsService: AdminsService,
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
  async assignToEmployees(
    @Param('id') id: string,
    @Body() dto: AssignApplicationDto,
    @Request() req,
  ) {
    const employeeIds =
      dto.employeeIds && dto.employeeIds.length > 0
        ? dto.employeeIds
        : [req.user.userId];

    const employees: Array<{ id: string; name: string }> = [];
    for (const employeeId of employeeIds) {
      const employee = await this.employeesService.findOne(employeeId);
      employees.push({ id: employeeId, name: employee.fullName });
      await this.employeesService.addAssignedApplication(employeeId, id);
    }

    return this.applicationsService.assignToEmployees(
      id,
      employees,
      new Date(dto.deadline),
    );
  }

  @Patch(':id/status')
  @Roles('employee', 'admin')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req,
  ) {
    const actorId = req.user.userId;
    const actor =
      req.user.role === 'admin'
        ? await this.adminsService.findOne(actorId)
        : await this.employeesService.findOne(actorId);
    const actorModel = req.user.role === 'admin' ? 'Admin' : 'Employee';
    const actorName = actor.fullName;
    return this.applicationsService.updateApplicationStatus(
      id,
      dto.status,
      {
        id: actorId,
        name: actorName,
        model: actorModel,
      },
      dto.comment,
    );
  }

  @Patch(':id/deadline')
  @Roles('employee', 'admin')
  async extendDeadline(
    @Param('id') id: string,
    @Body() dto: ExtendDeadlineDto,
    @Request() req,
  ) {
    const employeeId = req.user.userId;
    const employee = await this.employeesService.findOne(employeeId);
    return this.applicationsService.extendDeadline(
      id,
      new Date(dto.newDeadline),
      dto.reason,
      employeeId,
      employee.fullName,
    );
  }

  @Post(':id/complete')
  @Roles('employee', 'admin')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async completeApplication(
    @Param('id') id: string,
    @Body() dto: CompleteApplicationDto,
    @UploadedFiles() files: any[],
    @Request() req,
  ) {
    const actorId = req.user.userId;
    const actor =
      req.user.role === 'admin'
        ? await this.adminsService.findOne(actorId)
        : await this.employeesService.findOne(actorId);
    const actorModel = req.user.role === 'admin' ? 'Admin' : 'Employee';

    const imageUrls = (files || [])
      .map((f: any) => this.toUploadsUrlPath(f?.path))
      .filter(Boolean);

    const completionImages =
      dto.images && dto.images.length > 0 ? dto.images : imageUrls;

    return this.applicationsService.completeApplication(
      id,
      dto,
      completionImages,
      actorId,
      actor.fullName,
      actorModel,
    );
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
