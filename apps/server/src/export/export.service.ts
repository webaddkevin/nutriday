import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取记录数量估算
   */
  async getRecordCount(
    userId: number,
    type: string,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const where = {
      userId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
      },
    };

    switch (type) {
      case 'meal':
        return this.prisma.mealLog.count({ where });
      case 'water':
        return this.prisma.waterLog.count({ where });
      case 'weight':
        return this.prisma.weightLog.count({ where });
      default:
        return 0;
    }
  }

  /**
   * 导出数据
   */
  async exportData(
    userId: number,
    types: string[],
    startDate: string,
    endDate: string,
    format: 'csv' | 'json',
  ): Promise<string> {
    const data: Record<string, unknown[]> = {};

    for (const type of types) {
      data[type] = await this.fetchData(userId, type, startDate, endDate);
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    return this.toCSV(data);
  }

  private async fetchData(
    userId: number,
    type: string,
    startDate: string,
    endDate: string,
  ): Promise<unknown[]> {
    const where = {
      userId,
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59'),
      },
    };

    switch (type) {
      case 'meal':
        return this.prisma.mealLog.findMany({
          where,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            date: true,
            mealType: true,
            foodName: true,
            amount: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            createdAt: true,
          },
        });
      case 'water':
        return this.prisma.waterLog.findMany({
          where,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            date: true,
            amount: true,
            createdAt: true,
          },
        });
      case 'weight':
        return this.prisma.weightLog.findMany({
          where,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            date: true,
            weight: true,
            note: true,
            createdAt: true,
          },
        });
      default:
        return [];
    }
  }

  private toCSV(data: Record<string, unknown[]>): string {
    const lines: string[] = [];

    for (const [type, records] of Object.entries(data)) {
      if (records.length === 0) continue;

      lines.push(`\n# ${type} records`);
      const headers = Object.keys(records[0] as Record<string, unknown>);
      lines.push(headers.join(','));

      for (const record of records) {
        const values = headers.map((h) => {
          const val = (record as Record<string, unknown>)[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
          return String(val);
        });
        lines.push(values.join(','));
      }
    }

    return lines.join('\n');
  }
}
