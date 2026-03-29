import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post()
  create(@Body() dto: CreateMealPlanDto) {
    return this.mealPlanService.create(dto);
  }

  @Get()
  findByDate(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('date') date: string,
  ) {
    return this.mealPlanService.findByDate(userId, date);
  }

  @Get('range')
  findByRange(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.mealPlanService.findByRange(userId, startDate, endDate);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateMealPlanDto,
  ) {
    return this.mealPlanService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.mealPlanService.delete(id, userId);
  }
}
