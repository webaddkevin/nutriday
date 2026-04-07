import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecognizedFood {
  name: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  unit: string;
  category?: string;
}

export interface AIRecognitionResult {
  success: boolean;
  foods: RecognizedFood[];
  message?: string;
  totalCalories?: number;
}

@Injectable()
export class AIRecognitionService {
  private readonly logger = new Logger(AIRecognitionService.name);

  // 食物营养数据库（基于中国食物成分表）
  private readonly foodDatabase: Record<
    string,
    Omit<RecognizedFood, 'confidence'>
  > = {
    // 主食类
    米饭: {
      name: '米饭',
      calories: 116,
      protein: 2.6,
      carbs: 25.9,
      fat: 0.3,
      fiber: 0.3,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    糙米饭: {
      name: '糙米饭',
      calories: 112,
      protein: 2.6,
      carbs: 23.5,
      fat: 0.9,
      fiber: 1.8,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    面条: {
      name: '面条',
      calories: 138,
      protein: 4.5,
      carbs: 28.1,
      fat: 0.8,
      fiber: 0.8,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    馒头: {
      name: '馒头',
      calories: 223,
      protein: 7.0,
      carbs: 47.0,
      fat: 1.1,
      fiber: 1.3,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    面包: {
      name: '面包',
      calories: 247,
      protein: 9.5,
      carbs: 46.4,
      fat: 2.8,
      fiber: 2.7,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    全麦面包: {
      name: '全麦面包',
      calories: 246,
      protein: 10.5,
      carbs: 44.4,
      fat: 3.4,
      fiber: 6.0,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    燕麦: {
      name: '燕麦',
      calories: 367,
      protein: 15.0,
      carbs: 66.0,
      fat: 6.7,
      fiber: 10.3,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    粥: {
      name: '粥',
      calories: 30,
      protein: 0.7,
      carbs: 6.5,
      fat: 0.1,
      fiber: 0.1,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    饺子: {
      name: '饺子',
      calories: 198,
      protein: 7.5,
      carbs: 26.5,
      fat: 7.0,
      fiber: 1.2,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },
    包子: {
      name: '包子',
      calories: 227,
      protein: 6.4,
      carbs: 38.0,
      fat: 5.5,
      fiber: 1.2,
      servingSize: 100,
      unit: 'g',
      category: '主食',
    },

    // 肉类
    鸡胸肉: {
      name: '鸡胸肉',
      calories: 133,
      protein: 19.4,
      carbs: 2.5,
      fat: 5.0,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    鸡腿肉: {
      name: '鸡腿肉',
      calories: 181,
      protein: 16.0,
      carbs: 0,
      fat: 13.0,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    牛肉: {
      name: '牛肉',
      calories: 125,
      protein: 20.0,
      carbs: 0,
      fat: 4.2,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    牛排: {
      name: '牛排',
      calories: 271,
      protein: 26.0,
      carbs: 0,
      fat: 18.0,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    猪肉: {
      name: '猪肉',
      calories: 143,
      protein: 20.3,
      carbs: 0,
      fat: 6.2,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    五花肉: {
      name: '五花肉',
      calories: 349,
      protein: 9.3,
      carbs: 0,
      fat: 35.3,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },
    羊肉: {
      name: '羊肉',
      calories: 203,
      protein: 19.0,
      carbs: 0,
      fat: 14.1,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '肉类',
    },

    // 海鲜类
    鱼: {
      name: '鱼',
      calories: 105,
      protein: 22.0,
      carbs: 0,
      fat: 1.5,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '海鲜',
    },
    三文鱼: {
      name: '三文鱼',
      calories: 139,
      protein: 20.0,
      carbs: 0,
      fat: 6.3,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '海鲜',
    },
    虾: {
      name: '虾',
      calories: 99,
      protein: 24.0,
      carbs: 0.2,
      fat: 0.3,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '海鲜',
    },
    螃蟹: {
      name: '螃蟹',
      calories: 95,
      protein: 17.5,
      carbs: 2.3,
      fat: 2.6,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '海鲜',
    },
    鱿鱼: {
      name: '鱿鱼',
      calories: 75,
      protein: 15.2,
      carbs: 3.8,
      fat: 0.8,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '海鲜',
    },

    // 蛋类
    鸡蛋: {
      name: '鸡蛋',
      calories: 144,
      protein: 13.3,
      carbs: 2.8,
      fat: 8.8,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '蛋类',
    },
    鹌鹑蛋: {
      name: '鹌鹑蛋',
      calories: 160,
      protein: 12.8,
      carbs: 2.1,
      fat: 11.1,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '蛋类',
    },

    // 豆制品
    豆腐: {
      name: '豆腐',
      calories: 81,
      protein: 8.1,
      carbs: 4.2,
      fat: 3.7,
      fiber: 0.4,
      servingSize: 100,
      unit: 'g',
      category: '豆制品',
    },
    豆浆: {
      name: '豆浆',
      calories: 31,
      protein: 2.9,
      carbs: 1.2,
      fat: 1.6,
      fiber: 0.3,
      servingSize: 100,
      unit: 'ml',
      category: '豆制品',
    },
    黄豆: {
      name: '黄豆',
      calories: 359,
      protein: 35.0,
      carbs: 34.2,
      fat: 16.0,
      fiber: 15.5,
      servingSize: 100,
      unit: 'g',
      category: '豆制品',
    },

    // 蔬菜类
    西兰花: {
      name: '西兰花',
      calories: 33,
      protein: 4.1,
      carbs: 4.3,
      fat: 0.6,
      fiber: 2.6,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    白菜: {
      name: '白菜',
      calories: 17,
      protein: 1.5,
      carbs: 3.2,
      fat: 0.2,
      fiber: 0.8,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    菠菜: {
      name: '菠菜',
      calories: 23,
      protein: 2.6,
      carbs: 4.5,
      fat: 0.3,
      fiber: 1.7,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    番茄: {
      name: '番茄',
      calories: 18,
      protein: 0.9,
      carbs: 4.0,
      fat: 0.2,
      fiber: 0.5,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    黄瓜: {
      name: '黄瓜',
      calories: 15,
      protein: 0.8,
      carbs: 3.6,
      fat: 0.2,
      fiber: 0.5,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    土豆: {
      name: '土豆',
      calories: 81,
      protein: 2.6,
      carbs: 17.8,
      fat: 0.2,
      fiber: 1.2,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    红薯: {
      name: '红薯',
      calories: 86,
      protein: 1.6,
      carbs: 20.1,
      fat: 0.1,
      fiber: 1.6,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    胡萝卜: {
      name: '胡萝卜',
      calories: 37,
      protein: 1.0,
      carbs: 8.8,
      fat: 0.2,
      fiber: 1.1,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    茄子: {
      name: '茄子',
      calories: 21,
      protein: 1.1,
      carbs: 4.9,
      fat: 0.2,
      fiber: 1.3,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    青椒: {
      name: '青椒',
      calories: 22,
      protein: 1.0,
      carbs: 5.2,
      fat: 0.2,
      fiber: 1.4,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },
    蘑菇: {
      name: '蘑菇',
      calories: 20,
      protein: 2.9,
      carbs: 3.3,
      fat: 0.3,
      fiber: 0.8,
      servingSize: 100,
      unit: 'g',
      category: '蔬菜',
    },

    // 水果类
    苹果: {
      name: '苹果',
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 1.7,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    香蕉: {
      name: '香蕉',
      calories: 91,
      protein: 1.2,
      carbs: 22.0,
      fat: 0.2,
      fiber: 1.8,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    橙子: {
      name: '橙子',
      calories: 47,
      protein: 0.8,
      carbs: 11.8,
      fat: 0.2,
      fiber: 1.8,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    西瓜: {
      name: '西瓜',
      calories: 25,
      protein: 0.6,
      carbs: 5.8,
      fat: 0.1,
      fiber: 0.3,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    葡萄: {
      name: '葡萄',
      calories: 43,
      protein: 0.4,
      carbs: 10.3,
      fat: 0.2,
      fiber: 0.4,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    草莓: {
      name: '草莓',
      calories: 30,
      protein: 1.0,
      carbs: 7.1,
      fat: 0.2,
      fiber: 1.1,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    蓝莓: {
      name: '蓝莓',
      calories: 57,
      protein: 0.7,
      carbs: 14.5,
      fat: 0.3,
      fiber: 2.4,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },
    芒果: {
      name: '芒果',
      calories: 35,
      protein: 0.8,
      carbs: 8.3,
      fat: 0.1,
      fiber: 1.1,
      servingSize: 100,
      unit: 'g',
      category: '水果',
    },

    // 饮品
    牛奶: {
      name: '牛奶',
      calories: 54,
      protein: 3.0,
      carbs: 5.0,
      fat: 3.2,
      fiber: 0,
      servingSize: 100,
      unit: 'ml',
      category: '饮品',
    },
    酸奶: {
      name: '酸奶',
      calories: 72,
      protein: 2.5,
      carbs: 9.3,
      fat: 2.7,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '饮品',
    },
    低脂酸奶: {
      name: '低脂酸奶',
      calories: 57,
      protein: 3.5,
      carbs: 7.0,
      fat: 1.0,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '饮品',
    },
    咖啡: {
      name: '咖啡',
      calories: 2,
      protein: 0.3,
      carbs: 0.2,
      fat: 0,
      fiber: 0,
      servingSize: 100,
      unit: 'ml',
      category: '饮品',
    },
    茶: {
      name: '茶',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      servingSize: 100,
      unit: 'ml',
      category: '饮品',
    },
    果汁: {
      name: '果汁',
      calories: 45,
      protein: 0.2,
      carbs: 11.0,
      fat: 0.1,
      fiber: 0.2,
      servingSize: 100,
      unit: 'ml',
      category: '饮品',
    },

    // 坚果类
    杏仁: {
      name: '杏仁',
      calories: 578,
      protein: 21.0,
      carbs: 22.0,
      fat: 50.0,
      fiber: 12.5,
      servingSize: 100,
      unit: 'g',
      category: '坚果',
    },
    核桃: {
      name: '核桃',
      calories: 654,
      protein: 15.0,
      carbs: 14.0,
      fat: 65.0,
      fiber: 6.7,
      servingSize: 100,
      unit: 'g',
      category: '坚果',
    },
    花生: {
      name: '花生',
      calories: 567,
      protein: 25.0,
      carbs: 16.0,
      fat: 49.0,
      fiber: 8.5,
      servingSize: 100,
      unit: 'g',
      category: '坚果',
    },

    // 快餐/外卖
    汉堡: {
      name: '汉堡',
      calories: 295,
      protein: 17.0,
      carbs: 24.0,
      fat: 14.0,
      fiber: 1.5,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },
    披萨: {
      name: '披萨',
      calories: 266,
      protein: 11.0,
      carbs: 33.0,
      fat: 10.0,
      fiber: 2.3,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },
    炸鸡: {
      name: '炸鸡',
      calories: 246,
      protein: 18.0,
      carbs: 10.0,
      fat: 15.0,
      fiber: 0.5,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },
    薯条: {
      name: '薯条',
      calories: 312,
      protein: 3.4,
      carbs: 41.0,
      fat: 15.0,
      fiber: 3.8,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },
    寿司: {
      name: '寿司',
      calories: 150,
      protein: 6.0,
      carbs: 30.0,
      fat: 0.7,
      fiber: 0.8,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },
    沙拉: {
      name: '沙拉',
      calories: 20,
      protein: 1.5,
      carbs: 3.5,
      fat: 0.2,
      fiber: 1.2,
      servingSize: 100,
      unit: 'g',
      category: '快餐',
    },

    // 中式菜肴
    宫保鸡丁: {
      name: '宫保鸡丁',
      calories: 145,
      protein: 12.0,
      carbs: 8.0,
      fat: 7.0,
      fiber: 1.5,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    红烧肉: {
      name: '红烧肉',
      calories: 358,
      protein: 12.0,
      carbs: 5.0,
      fat: 33.0,
      fiber: 0.3,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    麻婆豆腐: {
      name: '麻婆豆腐',
      calories: 97,
      protein: 7.5,
      carbs: 4.5,
      fat: 5.5,
      fiber: 0.8,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    糖醋排骨: {
      name: '糖醋排骨',
      calories: 285,
      protein: 15.0,
      carbs: 18.0,
      fat: 17.0,
      fiber: 0.2,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    清蒸鱼: {
      name: '清蒸鱼',
      calories: 98,
      protein: 19.0,
      carbs: 1.0,
      fat: 2.0,
      fiber: 0,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    炒青菜: {
      name: '炒青菜',
      calories: 45,
      protein: 2.0,
      carbs: 4.0,
      fat: 2.5,
      fiber: 1.5,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
    番茄炒蛋: {
      name: '番茄炒蛋',
      calories: 97,
      protein: 7.0,
      carbs: 4.5,
      fat: 6.0,
      fiber: 0.5,
      servingSize: 100,
      unit: 'g',
      category: '中餐',
    },
  };

  // 食物同义词映射
  private readonly foodSynonyms: Record<string, string> = {
    饭: '米饭',
    白饭: '米饭',
    米: '米饭',
    面食: '面条',
    面: '面条',
    鸡肉: '鸡胸肉',
    鸡: '鸡胸肉',
    牛排: '牛肉',
    牛: '牛肉',
    猪: '猪肉',
    羊: '羊肉',
    三文治: '三明治',
    汉堡包: '汉堡',
    薯片: '薯条',
    橙: '橙子',
    柑橘: '橙子',
    蕃茄: '番茄',
    西红柿: '番茄',
    土豆丝: '土豆',
    马铃薯: '土豆',
    地瓜: '红薯',
    山芋: '红薯',
    甘蓝: '西兰花',
    花椰菜: '西兰花',
    菜花: '西兰花',
    炒饭: '米饭',
    盖饭: '米饭',
    便当: '米饭',
    盒饭: '米饭',
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 识别图片中的食物（模拟 AI 识别）
   * 实际项目中可以接入：
   * - 百度图像识别 API
   * - 腾讯云图像分析
   * - Google Cloud Vision
   * - OpenAI GPT-4 Vision
   */
  async recognizeFoodFromImage(
    imageBase64: string,
  ): Promise<AIRecognitionResult> {
    try {
      // TODO: 接入真实的 AI 视觉识别 API
      // 这里使用模拟识别，返回常见食物

      // 模拟识别结果（实际应该调用 AI API）
      const recognizedFoods = await this.simulateRecognition(imageBase64);

      if (recognizedFoods.length === 0) {
        return {
          success: false,
          foods: [],
          message: '未能识别出食物，请尝试拍摄更清晰的照片',
        };
      }

      const totalCalories = recognizedFoods.reduce(
        (sum, food) => sum + food.calories,
        0,
      );

      return {
        success: true,
        foods: recognizedFoods,
        totalCalories,
        message: `识别成功！共 ${recognizedFoods.length} 种食物`,
      };
    } catch (error) {
      this.logger.error(`食物识别失败: ${error}`);
      return {
        success: false,
        foods: [],
        message: '识别失败，请稍后重试',
      };
    }
  }

  /**
   * 模拟 AI 识别（用于演示）
   * 实际项目中替换为真实 API 调用
   */
  private async simulateRecognition(
    _imageBase64: string,
  ): Promise<RecognizedFood[]> {
    // 随机返回一些常见食物作为演示
    const commonFoods = [
      '米饭',
      '鸡胸肉',
      '西兰花',
      '鸡蛋',
      '牛奶',
      '苹果',
      '香蕉',
      '面包',
    ];

    const randomFoods = commonFoods
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    return randomFoods.map((foodName) => {
      const food = this.foodDatabase[foodName];
      return {
        ...food,
        confidence: 0.85 + Math.random() * 0.1, // 85%-95% 置信度
      };
    });
  }

  /**
   * 根据食物名称获取营养信息
   */
  async getNutritionByName(foodName: string): Promise<RecognizedFood | null> {
    // 先查找同义词
    const normalizedName =
      this.foodSynonyms[foodName] || this.findSimilarFood(foodName);

    // 从本地数据库查找
    const exactFood = this.foodDatabase[normalizedName || foodName];
    if (exactFood) {
      return {
        ...exactFood,
        confidence: 1.0,
      };
    }

    // 尝试模糊匹配
    const matchedFood = this.fuzzyMatchFood(foodName);
    if (matchedFood) {
      return {
        ...matchedFood,
        confidence: 0.8,
      };
    }

    // 从数据库查找
    const dbFood = await this.prisma.food.findFirst({
      where: {
        OR: [
          { name: { contains: foodName } },
          { nameEn: { contains: foodName } },
        ],
      },
    });

    if (dbFood) {
      return {
        name: dbFood.name,
        confidence: 0.9,
        calories: dbFood.calories,
        protein: dbFood.protein,
        carbs: dbFood.carbs,
        fat: dbFood.fat,
        fiber: dbFood.fiber || undefined,
        servingSize: dbFood.servingSize,
        unit: dbFood.unit,
        category: dbFood.category,
      };
    }

    return null;
  }

  /**
   * 查找相似食物
   */
  private findSimilarFood(foodName: string): string | null {
    // 遍历同义词表
    for (const [synonym, standardName] of Object.entries(this.foodSynonyms)) {
      if (foodName.includes(synonym) || synonym.includes(foodName)) {
        return standardName;
      }
    }

    // 遍历食物数据库
    for (const name of Object.keys(this.foodDatabase)) {
      if (foodName.includes(name) || name.includes(foodName)) {
        return name;
      }
    }

    return null;
  }

  /**
   * 模糊匹配食物
   */
  private fuzzyMatchFood(
    foodName: string,
  ): Omit<RecognizedFood, 'confidence'> | null {
    const lowerName = foodName.toLowerCase();

    // 按类别匹配
    const categoryKeywords: Record<string, string[]> = {
      主食: ['饭', '面', '粥', '面包', '馒头', '包子', '饺子', '饼'],
      肉类: ['鸡', '鸭', '鱼', '肉', '牛', '羊', '猪'],
      海鲜: ['虾', '蟹', '贝', '鱿鱼', '章鱼'],
      蔬菜: ['菜', '瓜', '萝卜', '茄子', '蘑菇', '豆芽'],
      水果: ['果', '莓', '桃', '梨', '蕉'],
      饮品: ['奶', '茶', '咖啡', '汁', '饮'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((k) => lowerName.includes(k))) {
        // 找到该类别的代表食物
        const categoryFood = Object.values(this.foodDatabase).find(
          (f) => f.category === category,
        );
        if (categoryFood) {
          return {
            ...categoryFood,
            name: foodName,
          };
        }
      }
    }

    return null;
  }

  /**
   * 批量识别食物
   */
  async recognizeMultipleFoods(foodNames: string[]): Promise<RecognizedFood[]> {
    const results: RecognizedFood[] = [];

    for (const name of foodNames) {
      const food = await this.getNutritionByName(name);
      if (food) {
        results.push(food);
      }
    }

    return results;
  }

  /**
   * 估算混合食物的营养（如炒饭、套餐等）
   */
  estimateMixedFood(foodName: string, ingredients: string[]): RecognizedFood {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const ingredient of ingredients) {
      const food = this.foodDatabase[ingredient];
      if (food) {
        totalCalories += food.calories;
        totalProtein += food.protein;
        totalCarbs += food.carbs;
        totalFat += food.fat;
        totalFiber += food.fiber || 0;
      }
    }

    // 平均值
    const count = ingredients.length || 1;

    return {
      name: foodName,
      confidence: 0.75,
      calories: Math.round(totalCalories / count),
      protein: Math.round((totalProtein / count) * 10) / 10,
      carbs: Math.round((totalCarbs / count) * 10) / 10,
      fat: Math.round((totalFat / count) * 10) / 10,
      fiber: Math.round((totalFiber / count) * 10) / 10,
      servingSize: 100,
      unit: 'g',
      category: '混合食物',
    };
  }

  /**
   * 获取所有食物分类
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const food of Object.values(this.foodDatabase)) {
      if (food.category) {
        categories.add(food.category);
      }
    }
    return Array.from(categories);
  }

  /**
   * 按分类获取食物列表
   */
  getFoodsByCategory(category: string): RecognizedFood[] {
    return Object.values(this.foodDatabase)
      .filter((food) => food.category === category)
      .map((food) => ({
        ...food,
        confidence: 1.0,
      }));
  }
}
