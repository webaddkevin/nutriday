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
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';
import { AuthService } from '../auth/auth.service';

@Controller('meal-plan')
export class MealPlanController {
  constructor(
    private readonly mealPlanService: MealPlanService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 从 header 提取用户 ID
   */
  private async extractUserId(authorization: string): Promise<number> {
    if (!authorization) {
      throw new UnauthorizedException('未提供认证信息');
    }
    const token = authorization.replace('Bearer ', '');
    const userId = await this.authService.validateToken(token);
    if (!userId) {
      throw new UnauthorizedException('无效的认证信息');
    }
    return userId;
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string,
    @Body() dto: CreateMealPlanDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.mealPlanService.create({ ...dto, userId });
  }

  @Get()
  async findByDate(
    @Headers('authorization') authorization: string,
    @Query('date') date: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.mealPlanService.findByDate(userId, date);
  }

  @Get('range')
  async findByRange(
    @Headers('authorization') authorization: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.mealPlanService.findByRange(userId, startDate, endDate);
  }

  @Put(':id')
  async update(
    @Headers('authorization') authorization: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealPlanDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.mealPlanService.update(id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @Headers('authorization') authorization: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.mealPlanService.delete(id, userId);
  }
}
