import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { FoodModule } from './food/food.module';
import { MealLogModule } from './meal-log/meal-log.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { WeightLogModule } from './weight-log/weight-log.module';

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    FoodModule,
    MealLogModule,
    RecommendationModule,
    WeightLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
