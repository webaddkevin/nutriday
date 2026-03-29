import { Module } from '@nestjs/common';
import { FoodFavoriteController } from './food-favorite.controller';
import { FoodFavoriteService } from './food-favorite.service';

@Module({
  controllers: [FoodFavoriteController],
  providers: [FoodFavoriteService],
})
export class FoodFavoriteModule {}
