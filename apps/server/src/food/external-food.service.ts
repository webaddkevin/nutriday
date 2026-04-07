import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExternalFood {
  name: string;
  nameEn?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  source: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
  }[];
}

@Injectable()
export class ExternalFoodService {
  private readonly logger = new Logger(ExternalFoodService.name);
  private readonly USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';
  private readonly USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 从 USDA 搜索食物
   */
  async searchFromUSDA(query: string, pageSize = 10): Promise<ExternalFood[]> {
    try {
      const url = `${this.USDA_BASE_URL}/foods/search?api_key=${this.USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR Legacy`;

      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`USDA API 请求失败: ${response.status}`);
        return [];
      }

      const data = (await response.json()) as { foods: USDAFood[] };
      return this.parseUSDAFoods(data.foods || []);
    } catch (error) {
      this.logger.error(`USDA API 请求异常: ${error}`);
      return [];
    }
  }

  /**
   * 解析 USDA 食物数据
   */
  private parseUSDAFoods(foods: USDAFood[]): ExternalFood[] {
    return foods.map((food) => {
      const nutrients = this.extractNutrients(food.foodNutrients);

      return {
        name: food.description,
        nameEn: food.description,
        calories: nutrients.calories,
        protein: nutrients.protein,
        carbs: nutrients.carbs,
        fat: nutrients.fat,
        fiber: nutrients.fiber,
        servingSize: 100,
        source: 'usda',
      };
    });
  }

  /**
   * 提取营养素数据
   */
  private extractNutrients(nutrients: USDAFood['foodNutrients']) {
    const result = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    for (const item of nutrients) {
      switch (item.nutrientId) {
        case 1008: // Energy (kcal)
          result.calories = Math.round(item.value);
          break;
        case 1003: // Protein
          result.protein = Math.round(item.value * 10) / 10;
          break;
        case 1005: // Carbohydrate, by difference
          result.carbs = Math.round(item.value * 10) / 10;
          break;
        case 1004: // Total lipid (fat)
          result.fat = Math.round(item.value * 10) / 10;
          break;
        case 1079: // Fiber, total dietary
          result.fiber = Math.round(item.value * 10) / 10;
          break;
      }
    }

    return result;
  }

  /**
   * 使用 AI 估算食物营养（当数据库和外部 API 都找不到时）
   */
  estimateNutrition(foodName: string): ExternalFood | null {
    // 常见食物的营养估算（基于 100g）
    const estimates: Record<string, Partial<ExternalFood>> = {
      // 主食类
      饭: { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3 },
      面: { calories: 138, protein: 4.5, carbs: 28.1, fat: 0.8 },
      粥: { calories: 30, protein: 0.7, carbs: 6.5, fat: 0.1 },
      面包: { calories: 247, protein: 9.5, carbs: 46.4, fat: 2.8 },
      馒头: { calories: 223, protein: 7.0, carbs: 47.0, fat: 1.1 },

      // 肉类
      鸡: { calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
      牛: { calories: 250, protein: 26.0, carbs: 0, fat: 15.0 },
      猪: { calories: 242, protein: 27.0, carbs: 0, fat: 14.0 },
      鱼: { calories: 105, protein: 22.0, carbs: 0, fat: 1.5 },
      虾: { calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3 },

      // 蔬菜
      菜: { calories: 20, protein: 1.5, carbs: 4.0, fat: 0.2 },
      瓜: { calories: 15, protein: 0.7, carbs: 3.5, fat: 0.1 },

      // 水果
      果: { calories: 50, protein: 0.5, carbs: 12.0, fat: 0.1 },

      // 饮品
      茶: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      咖啡: { calories: 2, protein: 0.3, carbs: 0.2, fat: 0 },
      奶: { calories: 54, protein: 3.0, carbs: 5.0, fat: 3.2 },
    };

    // 尝试匹配关键词
    for (const [keyword, nutrition] of Object.entries(estimates)) {
      if (foodName.includes(keyword)) {
        return {
          name: foodName,
          calories: nutrition.calories || 0,
          protein: nutrition.protein || 0,
          carbs: nutrition.carbs || 0,
          fat: nutrition.fat || 0,
          fiber: 0,
          servingSize: 100,
          source: 'estimated',
        };
      }
    }

    // 默认估算（中等热量）
    return {
      name: foodName,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 1,
      servingSize: 100,
      source: 'estimated',
    };
  }

  /**
   * 综合搜索食物（本地 + 外部 API + AI 估算）
   */
  async searchFood(query: string): Promise<ExternalFood[]> {
    const results: ExternalFood[] = [];

    // 1. 先搜索本地数据库
    const localFoods = await this.prisma.food.findMany({
      where: {
        OR: [{ name: { contains: query } }, { nameEn: { contains: query } }],
      },
      take: 20,
    });

    for (const food of localFoods) {
      results.push({
        name: food.name,
        nameEn: food.nameEn || undefined,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || undefined,
        servingSize: food.servingSize,
        source: 'local',
      });
    }

    // 2. 如果本地结果不足，尝试 USDA API
    if (results.length < 5) {
      const usdaFoods = await this.searchFromUSDA(query, 10);
      results.push(...usdaFoods);
    }

    // 3. 如果还是找不到，使用 AI 估算
    if (results.length === 0) {
      const estimated = this.estimateNutrition(query);
      if (estimated) {
        results.push(estimated);
      }
    }

    return results;
  }

  /**
   * 保存外部食物到本地数据库
   */
  async saveExternalFood(food: ExternalFood): Promise<number> {
    const existing = await this.prisma.food.findFirst({
      where: { name: food.name },
    });

    if (existing) {
      return existing.id;
    }

    const created = await this.prisma.food.create({
      data: {
        name: food.name,
        nameEn: food.nameEn,
        category: '其他',
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
        servingSize: food.servingSize,
        unit: 'g',
        source: food.source,
      },
    });

    return created.id;
  }
}
