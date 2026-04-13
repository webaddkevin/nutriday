import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExportService } from './export.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('export')
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('count')
  async getCount(
    @Request() req: { user: { userId: number } },
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const count = await this.exportService.getRecordCount(
      req.user.userId,
      type,
      startDate,
      endDate,
    );
    return { count };
  }

  @Post()
  async export(
    @Request() req: { user: { userId: number } },
    @Body()
    body: {
      types: string[];
      startDate: string;
      endDate: string;
      format: 'csv' | 'json';
    },
  ) {
    const content = await this.exportService.exportData(
      req.user.userId,
      body.types,
      body.startDate,
      body.endDate,
      body.format,
    );
    return { content };
  }
}
