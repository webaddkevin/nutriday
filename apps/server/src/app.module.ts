import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { FoodModule } from './food/food.module';
import { MealLogModule } from './meal-log/meal-log.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { WeightLogModule } from './weight-log/weight-log.module';
import { WaterLogModule } from './water-log/water-log.module';
import { ShoppingModule } from './shopping/shopping.module';
import { MealPlanModule } from './meal-plan/meal-plan.module';
import { FoodFavoriteModule } from './food-favorite/food-favorite.module';
import { BarcodeModule } from './barcode/barcode.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProfileModule,
    FoodModule,
    MealLogModule,
    RecommendationModule,
    WeightLogModule,
    WaterLogModule,
    ShoppingModule,
    MealPlanModule,
    FoodFavoriteModule,
    BarcodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
