import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FoodInfo {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  servingSize?: number;
  unit: string;
  imageUrl?: string;
  source: string;
}

interface OpenFoodFactsProduct {
  code: string;
  product?: {
    product_name?: string;
    product_name_zh?: string;
    brands?: string;
    categories?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'energy-kcal'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sodium_100g?: number;
    };
    serving_size?: string;
    image_front_url?: string;
    image_url?: string;
  };
  status: number;
  status_verbose?: string;
}

@Injectable()
export class BarcodeService {
  private readonly logger = new Logger(BarcodeService.name);
  private readonly OFF_API = 'https://world.openfoodfacts.org/api/v2/product';

  constructor(private prisma: PrismaService) {}

  /**
   * 通过条码查询食品信息
   */
  async lookupByBarcode(barcode: string): Promise<FoodInfo | null> {
    // 1. 先查本地数据库
    const localFood = await this.prisma.food.findFirst({
      where: { barcode },
    });

    if (localFood) {
      return {
        barcode: localFood.barcode!,
        name: localFood.name,
        brand: localFood.brand || undefined,
        category: localFood.category || undefined,
        calories: localFood.calories,
        protein: localFood.protein,
        carbs: localFood.carbs,
        fat: localFood.fat,
        fiber: localFood.fiber || undefined,
        sodium: localFood.sodium || undefined,
        servingSize: localFood.servingSize,
        unit: localFood.unit,
        imageUrl: localFood.imageUrl || undefined,
        source: 'local',
      };
    }

    // 2. 调用 Open Food Facts API
    try {
      const response = await fetch(`${this.OFF_API}/${barcode}.json`, {
        headers: {
          'User-Agent': 'Nutriday/1.0 (nutriday.app)',
        },
      });

      if (!response.ok) {
        this.logger.error(`OFF API error: ${response.status}`);
        return null;
      }

      const data: OpenFoodFactsProduct = await response.json();

      if (data.status !== 1 || !data.product) {
        this.logger.warn(`Product not found: ${barcode}`);
        return null;
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      // 提取营养信息
      const foodInfo: FoodInfo = {
        barcode,
        name: product.product_name_zh || product.product_name || '未知食品',
        brand: product.brands,
        category: this.extractCategory(product.categories),
        calories:
          nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
        protein: nutriments.proteins_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fat: nutriments.fat_100g || 0,
        fiber: nutriments.fiber_100g,
        sodium: nutriments.sodium_100g,
        servingSize: this.parseServingSize(product.serving_size),
        unit: 'g',
        imageUrl: product.image_front_url || product.image_url,
        source: 'openfoodfacts',
      };

      return foodInfo;
    } catch (error) {
      this.logger.error(`Failed to lookup barcode: ${error}`);
      return null;
    }
  }

  /**
   * 保存食品信息到本地数据库
   */
  async saveFood(foodInfo: FoodInfo): Promise<{ id: number }> {
    const food = await this.prisma.food.create({
      data: {
        name: foodInfo.name,
        nameEn: foodInfo.brand,
        category: foodInfo.category || '其他',
        calories: foodInfo.calories,
        protein: foodInfo.protein,
        carbs: foodInfo.carbs,
        fat: foodInfo.fat,
        fiber: foodInfo.fiber,
        sodium: foodInfo.sodium,
        servingSize: foodInfo.servingSize || 100,
        unit: foodInfo.unit,
        imageUrl: foodInfo.imageUrl,
        barcode: foodInfo.barcode,
        brand: foodInfo.brand,
        source: foodInfo.source,
      },
    });

    return { id: food.id };
  }

  /**
   * 提取分类（取第一个）
   */
  private extractCategory(categories?: string): string {
    if (!categories) return '其他';
    const list = categories.split(',');
    return list[0].trim() || '其他';
  }

  /**
   * 解析份量大小
   */
  private parseServingSize(serving?: string): number | undefined {
    if (!serving) return undefined;
    // 尝试解析 "100g", "100 g", "100ml" 等格式
    const match = serving.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]);
    }
    return undefined;
  }
}
