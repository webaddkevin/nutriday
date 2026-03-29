import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodDto } from './dto/create-food.dto';

@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建食物
   */
  async create(dto: CreateFoodDto) {
    return this.prisma.food.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn,
        category: dto.category,
        calories: dto.calories,
        protein: dto.protein,
        carbs: dto.carbs,
        fat: dto.fat,
        fiber: dto.fiber,
        sodium: dto.sodium,
        servingSize: dto.servingSize || 100,
        unit: dto.unit || 'g',
        imageUrl: dto.imageUrl,
      },
    });
  }

  /**
   * 搜索食物
   */
  async search(keyword: string, limit = 20) {
    return this.prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: keyword } },
          { nameEn: { contains: keyword } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 按分类获取食物列表
   */
  async findByCategory(category: string, limit = 50) {
    return this.prisma.food.findMany({
      where: { category },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * 获取所有分类
   */
  async getCategories() {
    const foods = await this.prisma.food.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return foods.map((f) => f.category);
  }

  /**
   * 根据 ID 获取食物详情
   */
  async findById(id: number) {
    return this.prisma.food.findUnique({
      where: { id },
    });
  }

  /**
   * 批量创建食物（用于初始化数据）
   */
  async createMany(foods: CreateFoodDto[]) {
    return this.prisma.food.createMany({
      data: foods,
    });
  }
}
