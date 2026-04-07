import { Module } from '@nestjs/common';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';
import { ExternalFoodService } from './external-food.service';

@Module({
  controllers: [FoodController],
  providers: [FoodService, ExternalFoodService],
  exports: [FoodService, ExternalFoodService],
})
export class FoodModule {}
