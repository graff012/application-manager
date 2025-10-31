import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../admins/schemas/admin.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const fullName = this.configService.get<string>('ADMIN_FULLNAME') || 'System Administrator';

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env - skipping admin seed');
      return;
    }

    try {
      // Check if admin already exists
      const existingAdmin = await this.adminModel.findOne({ email }).exec();

      if (existingAdmin) {
        this.logger.log(`Admin user already exists: ${email}`);
        return;
      }

      // Create new admin
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await this.adminModel.create({
        email,
        password: hashedPassword,
        fullName,
        role: 'admin',
      });

      this.logger.log(`✅ Admin user created successfully: ${email}`);
      this.logger.log(`Admin ID: ${admin.id}`);
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
