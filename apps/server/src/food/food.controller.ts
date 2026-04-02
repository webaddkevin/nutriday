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
    const food = await this.foodService.create(dto);
    return { code: 0, message: '创建成功', data: food };
  }

  /**
   * 批量创建食物
   */
  @Post('batch')
  async createMany(@Body() foods: CreateFoodDto[]) {
    const result = await this.foodService.createMany(foods);
    return { code: 0, message: '批量创建成功', data: result };
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
    const foods = await this.foodService.search(
      keyword,
      limit ? parseInt(limit) : 20,
    );
    return { code: 0, message: '查询成功', data: foods };
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
    const foods = await this.foodService.findByCategory(
      category,
      limit ? parseInt(limit) : 50,
    );
    return { code: 0, message: '查询成功', data: foods };
  }

  /**
   * 获取所有分类
   */
  @Public()
  @Get('categories')
  async getCategories() {
    const categories = await this.foodService.getCategories();
    return { code: 0, message: '查询成功', data: categories };
  }

  /**
   * 获取食物详情
   */
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    const food = await this.foodService.findById(parseInt(id));
    if (!food) {
      return { code: 404, message: '食物不存在', data: null };
    }
    return { code: 0, message: '查询成功', data: food };
  }
}
