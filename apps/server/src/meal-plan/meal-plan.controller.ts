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
import { UserId } from '../common/decorators/user.decorator';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Post()
  async create(@UserId() userId: number, @Body() dto: CreateMealPlanDto) {
    return this.mealPlanService.create({ ...dto, userId });
  }

  @Get()
  async findByDate(@UserId() userId: number, @Query('date') date: string) {
    return this.mealPlanService.findByDate(userId, date);
  }

  @Get('range')
  async findByRange(
    @UserId() userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.mealPlanService.findByRange(userId, startDate, endDate);
  }

  @Put(':id')
  async update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealPlanDto,
  ) {
    return this.mealPlanService.update(id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealPlanService.delete(id, userId);
  }
}
