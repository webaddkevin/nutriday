import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  /**
   * 创建食物
   */
  @Post()
  async create(@Body() dto: CreateFoodDto) {
    return this.foodService.create(dto);
  }

  /**
   * 批量创建食物
   */
  @Post('batch')
  async createMany(@Body() foods: CreateFoodDto[]) {
    return this.foodService.createMany(foods);
  }

  /**
   * 搜索食物
   */
  @Public()
  @Get('search')
  async search(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ) {
    return this.foodService.search(keyword, limit ? parseInt(limit) : 20);
  }

  /**
   * 按分类获取食物
   */
  @Public()
  @Get('category/:category')
  async findByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    return this.foodService.findByCategory(
      category,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * 获取所有分类
   */
  @Public()
  @Get('categories')
  async getCategories() {
    return this.foodService.getCategories();
  }

  /**
   * 获取食物详情
   */
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.foodService.findById(parseInt(id));
  }
}
