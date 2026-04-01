import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';

@Injectable()
export class MealPlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMealPlanDto & { userId: number }) {
    return this.prisma.mealPlan.create({
      data: {
        userId: dto.userId,
        date: dto.date,
        mealType: dto.mealType,
        dishName: dto.dishName,
        calories: dto.calories || 0,
        note: dto.note,
      },
    });
  }

  async findByDate(userId: number, date: string) {
    return this.prisma.mealPlan.findMany({
      where: { userId, date },
      orderBy: { mealType: 'asc' },
    });
  }

  async findByRange(userId: number, startDate: string, endDate: string) {
    return this.prisma.mealPlan.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: [{ date: 'asc' }, { mealType: 'asc' }],
    });
  }

  async update(id: number, userId: number, dto: UpdateMealPlanDto) {
    return this.prisma.mealPlan.update({
      where: { id, userId },
      data: dto,
    });
  }

  async delete(id: number, userId: number) {
    return this.prisma.mealPlan.delete({
      where: { id, userId },
    });
  }
}
