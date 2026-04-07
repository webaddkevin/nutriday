import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoodService } from '../food/food.service';

interface UserProfileData {
  gender: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: number;
  bmr?: number;
  tdee?: number;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foodService: FoodService,
  ) {}

  /**
   * 获取 AI 推荐的饮食建议
   */
  async getMealRecommendation(
    userId: number,
    mealType: string,
    targetCalories: number,
  ): Promise<any> {
    // 获取用户画像
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      throw new Error('用户画像不存在');
    }

    // 获取最近 7 天的饮食记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const recentLogs = await this.prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    // 计算最近 7 天平均营养摄入
    const avgNutrition = this.calculateAverageNutrition(recentLogs);

    // 获取所有食物数据
    const foods = await this.prisma.food.findMany();

    // 基于规则生成推荐（后续可接入 AI 模型）
    const recommendations = this.generateRuleBasedRecommendations(
      profile,
      avgNutrition,
      mealType,
      targetCalories,
      foods,
    );

    return {
      userProfile: {
        goal: profile.goal,
        tdee: profile.tdee,
      },
      avgNutrition,
      recommendations,
      tips: this.generateTips(profile, avgNutrition),
    };
  }

  /**
   * 计算平均营养摄入
   */
  private calculateAverageNutrition(logs: any[]): DailyNutrition {
    if (logs.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const dailyTotals = new Map<string, DailyNutrition>();

    for (const log of logs) {
      const existing = dailyTotals.get(log.date) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      existing.calories += log.calories;
      existing.protein += log.protein;
      existing.carbs += log.carbs;
      existing.fat += log.fat;
      dailyTotals.set(log.date, existing);
    }

    const days = Array.from(dailyTotals.values());
    return {
      calories: Math.round(
        days.reduce((s, d) => s + d.calories, 0) / days.length,
      ),
      protein:
        Math.round(
          (days.reduce((s, d) => s + d.protein, 0) / days.length) * 10,
        ) / 10,
      carbs:
        Math.round((days.reduce((s, d) => s + d.carbs, 0) / days.length) * 10) /
        10,
      fat:
        Math.round((days.reduce((s, d) => s + d.fat, 0) / days.length) * 10) /
        10,
    };
  }

  /**
   * 基于规则生成推荐
   */
  private generateRuleBasedRecommendations(
    profile: any,
    avgNutrition: DailyNutrition,
    mealType: string,
    targetCalories: number,
    foods: any[],
  ): any[] {
    const recommendations: any[] = [];
    const goal = profile.goal;

    // 根据目标确定营养比例
    let proteinRatio = 0.25;
    let carbsRatio = 0.5;
    let fatRatio = 0.25;

    if (goal === 'lose_fat') {
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatRatio = 0.3;
    } else if (goal === 'gain_muscle') {
      proteinRatio = 0.3;
      carbsRatio = 0.45;
      fatRatio = 0.25;
    }

    // 使用比例计算（避免 unused 警告）
    void proteinRatio;
    void carbsRatio;
    void fatRatio;

    // 每餐热量目标
    const mealCalorieTargets: Record<string, number> = {
      breakfast: targetCalories * 0.3,
      lunch: targetCalories * 0.4,
      dinner: targetCalories * 0.25,
      snack: targetCalories * 0.05,
    };

    const mealTarget = mealCalorieTargets[mealType] || targetCalories * 0.25;

    // 根据餐食类型选择食物
    const mealFoods = this.selectFoodsForMeal(
      foods,
      mealType,
      mealTarget,
      goal,
    );

    for (const combo of mealFoods.slice(0, 3)) {
      recommendations.push({
        name: combo.name,
        foods: combo.foods,
        totalCalories: combo.totalCalories,
        protein: combo.protein,
        carbs: combo.carbs,
        fat: combo.fat,
        reason: combo.reason,
      });
    }

    return recommendations;
  }

  /**
   * 为特定餐食选择食物组合
   */
  private selectFoodsForMeal(
    foods: any[],
    mealType: string,
    targetCalories: number,
    _goal: string,
  ): any[] {
    const combos: any[] = [];

    // 早餐组合
    if (mealType === 'breakfast') {
      const eggs = foods.find((f) => f.name === '鸡蛋');
      const milk = foods.find((f) => f.name === '牛奶');
      const bread = foods.find((f) => f.name === '全麦面包');
      const oatmeal = foods.find((f) => f.name === '燕麦');
      const banana = foods.find((f) => f.name === '香蕉');

      if (eggs && bread) {
        combos.push(
          this.createCombo(
            '经典早餐',
            [eggs, bread],
            [100, 80],
            '均衡营养，提供持久能量',
          ),
        );
      }
      if (oatmeal && milk && banana) {
        combos.push(
          this.createCombo(
            '燕麦早餐',
            [oatmeal, milk, banana],
            [50, 200, 100],
            '高纤维，促进消化',
          ),
        );
      }
      if (eggs && milk) {
        combos.push(
          this.createCombo(
            '轻食早餐',
            [eggs, milk],
            [100, 250],
            '高蛋白，适合减脂',
          ),
        );
      }
    }

    // 午餐/晚餐组合
    if (mealType === 'lunch' || mealType === 'dinner') {
      const chicken = foods.find((f) => f.name === '鸡胸肉');
      const rice = foods.find((f) => f.name === '糙米饭');
      const broccoli = foods.find((f) => f.name === '西兰花');
      const salmon = foods.find((f) => f.name === '三文鱼');
      const tofu = foods.find((f) => f.name === '豆腐');
      const shrimp = foods.find((f) => f.name === '虾');

      if (chicken && rice && broccoli) {
        combos.push(
          this.createCombo(
            '健身餐',
            [chicken, rice, broccoli],
            [150, 150, 100],
            '高蛋白低脂，增肌首选',
          ),
        );
      }
      if (salmon && rice && broccoli) {
        combos.push(
          this.createCombo(
            '三文鱼套餐',
            [salmon, rice, broccoli],
            [120, 100, 100],
            '富含Omega-3，有益心血管',
          ),
        );
      }
      if (tofu && rice && broccoli) {
        combos.push(
          this.createCombo(
            '素食套餐',
            [tofu, rice, broccoli],
            [150, 150, 100],
            '植物蛋白，清淡健康',
          ),
        );
      }
      if (shrimp && rice && broccoli) {
        combos.push(
          this.createCombo(
            '虾仁套餐',
            [shrimp, rice, broccoli],
            [120, 120, 100],
            '低脂高蛋白，减脂推荐',
          ),
        );
      }
    }

    // 加餐组合
    if (mealType === 'snack') {
      const apple = foods.find((f) => f.name === '苹果');
      const yogurt = foods.find((f) => f.name === '低脂酸奶');
      const almond = foods.find((f) => f.name === '杏仁');

      if (apple) {
        combos.push(this.createCombo('水果加餐', [apple], [150], '补充维生素'));
      }
      if (yogurt) {
        combos.push(
          this.createCombo('酸奶加餐', [yogurt], [150], '补充蛋白质和益生菌'),
        );
      }
      if (almond) {
        combos.push(
          this.createCombo('坚果加餐', [almond], [20], '健康脂肪，增加饱腹感'),
        );
      }
    }

    return combos;
  }

  /**
   * 创建食物组合
   */
  private createCombo(
    name: string,
    foods: any[],
    amounts: number[],
    reason: string,
  ): any {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    const foodItems = foods.map((food, i) => {
      const ratio = amounts[i] / 100;
      calories += food.calories * ratio;
      protein += food.protein * ratio;
      carbs += food.carbs * ratio;
      fat += food.fat * ratio;

      return {
        foodId: food.id,
        name: food.name,
        amount: amounts[i],
        unit: 'g',
      };
    });

    return {
      name,
      foods: foodItems,
      totalCalories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      reason,
    };
  }

  /**
   * 生成健康建议
   */
  private generateTips(profile: any, avgNutrition: DailyNutrition): string[] {
    const tips: string[] = [];
    const tdee = profile.tdee || 2000;

    // 热量分析
    const calorieRatio = avgNutrition.calories / tdee;
    if (calorieRatio < 0.8) {
      tips.push('热量摄入偏低，建议适当增加食量，避免营养不良');
    } else if (calorieRatio > 1.1) {
      tips.push('热量摄入超标，建议控制食量，增加运动');
    }

    // 蛋白质分析
    const targetProtein = (tdee * 0.25) / 4;
    if (avgNutrition.protein < targetProtein * 0.8) {
      tips.push('蛋白质摄入不足，建议增加鸡胸肉、鱼类、蛋类等高蛋白食物');
    }

    // 目标相关建议
    if (profile.goal === 'lose_fat') {
      tips.push('减脂期间建议控制碳水摄入，多吃蔬菜和优质蛋白');
    } else if (profile.goal === 'gain_muscle') {
      tips.push('增肌期间需要充足蛋白质和碳水，训练后及时补充');
    }

    if (tips.length === 0) {
      tips.push('继续保持，你的饮食很均衡！');
    }

    return tips;
  }
}
