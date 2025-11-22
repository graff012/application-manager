import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';
import { Tool, ToolSchema } from './schemas/tool.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tool.name, schema: ToolSchema }])],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
