import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWeightDto } from './dto/weight-log.dto';

/**
 * 体重记录服务
 */
@Injectable()
export class WeightLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存体重记录（存在则更新）
   */
  async saveWeight(dto: SaveWeightDto) {
    return this.prisma.weightLog.upsert({
      where: {
        userId_date: {
          userId: dto.userId,
          date: dto.date,
        },
      },
      create: {
        userId: dto.userId,
        date: dto.date,
        weight: Number(dto.weight),
        note: dto.note,
      },
      update: {
        weight: Number(dto.weight),
        note: dto.note,
      },
    });
  }

  /**
   * 获取某天的体重记录
   */
  async getWeight(userId: number, date: string) {
    return this.prisma.weightLog.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });
  }

  /**
   * 获取日期范围内的体重记录
   */
  async getWeightRange(userId: number, startDate: string, endDate: string) {
    return this.prisma.weightLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 获取体重趋势统计
   */
  async getWeightStats(userId: number) {
    // 获取所有体重记录
    const logs = await this.prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30, // 最近30条
    });

    if (logs.length === 0) {
      return {
        current: null,
        lowest: null,
        highest: null,
        change7d: null,
        change30d: null,
        logs: [],
      };
    }

    const weights = logs.map((l) => l.weight);
    const current = logs[0].weight;
    const lowest = Math.min(...weights);
    const highest = Math.max(...weights);

    // 计算7天变化
    const log7dAgo = logs.find((l) => {
      const diff = this.daysDiff(logs[0].date, l.date);
      return diff >= 6 && diff <= 8;
    });
    const change7d = log7dAgo ? current - log7dAgo.weight : null;

    // 计算30天变化
    const log30dAgo = logs.find((l) => {
      const diff = this.daysDiff(logs[0].date, l.date);
      return diff >= 28 && diff <= 32;
    });
    const change30d = log30dAgo ? current - log30dAgo.weight : null;

    return {
      current,
      lowest,
      highest,
      change7d,
      change30d,
      logs: logs.reverse(), // 按日期升序返回
    };
  }

  /**
   * 删除体重记录
   */
  async deleteWeight(userId: number, date: string) {
    return this.prisma.weightLog.delete({
      where: {
        userId_date: { userId, date },
      },
    });
  }

  /**
   * 计算两个日期之间的天数差
   */
  private daysDiff(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  }
}
