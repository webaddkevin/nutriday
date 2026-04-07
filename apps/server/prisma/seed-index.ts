import { PrismaClient } from '@prisma/client';
import { seedFoods } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据导入...');

  // 导入食物数据 - 使用 upsert 避免重复
  console.log('导入/更新食物数据...');
  let created = 0;
  let updated = 0;

  for (const food of seedFoods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data: {
          nameEn: food.nameEn,
          category: food.category,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          servingSize: food.servingSize,
        },
      });
      updated++;
    } else {
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
      created++;
    }
  }

  const totalCount = await prisma.food.count();
  console.log(
    `食物数据导入完成: 新增 ${created} 条, 更新 ${updated} 条, 总计 ${totalCount} 条`,
  );

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
