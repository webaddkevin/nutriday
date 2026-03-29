import { Module } from '@nestjs/common';
import { MealLogController } from './meal-log.controller';
import { MealLogService } from './meal-log.service';
import { FoodModule } from '../food/food.module';

@Module({
  imports: [FoodModule],
  controllers: [MealLogController],
  providers: [MealLogService],
  exports: [MealLogService],
})
export class MealLogModule {}
