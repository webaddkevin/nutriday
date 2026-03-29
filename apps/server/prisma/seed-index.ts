import { PrismaClient } from '@prisma/client';
import { seedFoods } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据导入...');

  // 导入食物数据
  const foodCount = await prisma.food.count();
  if (foodCount === 0) {
    console.log('导入食物数据...');
    for (const food of seedFoods) {
      await prisma.food.create({
        data: {
          name: food.name,
          nameEn: food.nameEn,
          category: food.category,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          servingSize: food.servingSize,
          unit: 'g',
          source: 'custom',
        },
      });
    }
    console.log(`已导入 ${seedFoods.length} 种食物`);
  } else {
    console.log(`食物数据库已有 ${foodCount} 条记录，跳过导入`);
  }

  console.log('种子数据导入完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
