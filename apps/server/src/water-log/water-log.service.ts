import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveWaterDto } from './dto/water-log.dto';

/**
 * 饮水记录服务
 */
@Injectable()
export class WaterLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存饮水记录（存在则更新）
   */
  async saveWater(dto: SaveWaterDto) {
    return this.prisma.waterLog.upsert({
      where: {
        userId_date: {
          userId: dto.userId,
          date: dto.date,
        },
      },
      create: {
        userId: dto.userId,
        date: dto.date,
        amount: Number(dto.amount),
        note: dto.note,
      },
      update: {
        amount: Number(dto.amount),
        note: dto.note,
      },
    });
  }

  /**
   * 增加饮水量
   */
  async addWater(userId: number, date: string, amount: number) {
    const existing = await this.prisma.waterLog.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (existing) {
      return this.prisma.waterLog.update({
        where: { id: existing.id },
        data: { amount: existing.amount + amount },
      });
    }

    return this.prisma.waterLog.create({
      data: { userId, date, amount },
    });
  }

  /**
   * 获取某天的饮水记录
   */
  async getWater(userId: number, date: string) {
    return this.prisma.waterLog.findUnique({
      where: { userId_date: { userId, date } },
    });
  }

  /**
   * 获取日期范围内的饮水记录
   */
  async getWaterRange(userId: number, startDate: string, endDate: string) {
    return this.prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 获取饮水统计
   */
  async getWaterStats(userId: number) {
    const logs = await this.prisma.waterLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    if (logs.length === 0) {
      return {
        today: 0,
        average7d: 0,
        average30d: 0,
        total7d: 0,
        total30d: 0,
        logs: [],
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find((l) => l.date === today);
    const todayAmount = todayLog?.amount || 0;

    // 计算7天平均
    const last7d = logs.slice(0, 7);
    const total7d = last7d.reduce((sum, l) => sum + l.amount, 0);
    const average7d = last7d.length > 0 ? total7d / last7d.length : 0;

    // 计算30天平均
    const total30d = logs.reduce((sum, l) => sum + l.amount, 0);
    const average30d = logs.length > 0 ? total30d / logs.length : 0;

    return {
      today: todayAmount,
      average7d: Math.round(average7d),
      average30d: Math.round(average30d),
      total7d,
      total30d,
      logs: logs.reverse(),
    };
  }

  /**
   * 删除饮水记录
   */
  async deleteWater(userId: number, date: string) {
    return this.prisma.waterLog.delete({
      where: { userId_date: { userId, date } },
    });
  }
}
