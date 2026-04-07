import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FoodService } from './food.service';
import { ExternalFoodService } from './external-food.service';
import { AIRecognitionService } from './ai-recognition.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('food')
export class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly externalFoodService: ExternalFoodService,
    private readonly aiRecognitionService: AIRecognitionService,
  ) {}

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
   * 保存外部食物到本地
   */
  @Post('save-external')
  async saveExternal(@Body() food: any) {
    const id = await this.externalFoodService.saveExternalFood(food);
    return { id, message: '保存成功' };
  }

  /**
   * 搜索食物（本地数据库）
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
   * 综合搜索食物（本地 + 外部 API + AI 估算）
   */
  @Public()
  @Get('search/enhanced')
  async enhancedSearch(@Query('keyword') keyword: string) {
    return this.externalFoodService.searchFood(keyword);
  }

  /**
   * 从 USDA 搜索食物
   */
  @Public()
  @Get('search/usda')
  async searchUSDA(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: string,
  ) {
    return this.externalFoodService.searchFromUSDA(
      keyword,
      limit ? parseInt(limit) : 10,
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
   * AI 识别食物图片
   */
  @Public()
  @Post('recognize')
  @UseInterceptors(FileInterceptor('image'))
  async recognizeFood(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: '请上传图片',
        foods: [],
      };
    }

    const imageBase64 = file.buffer.toString('base64');
    return this.aiRecognitionService.recognizeFoodFromImage(imageBase64);
  }

  /**
   * 根据食物名称获取营养信息
   */
  @Public()
  @Get('nutrition/:name')
  async getNutrition(@Param('name') name: string) {
    const food = await this.aiRecognitionService.getNutritionByName(name);
    if (!food) {
      return {
        success: false,
        message: '未找到该食物的营养信息',
      };
    }
    return {
      success: true,
      food,
    };
  }

  /**
   * 批量获取食物营养信息
   */
  @Public()
  @Post('nutrition/batch')
  async getNutritionBatch(@Body('names') names: string[]) {
    const foods = await this.aiRecognitionService.recognizeMultipleFoods(names);
    return {
      success: true,
      foods,
      totalCalories: foods.reduce((sum, f) => sum + f.calories, 0),
    };
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
   * 获取食物详情（放在最后，避免路由冲突）
   */
  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.foodService.findById(parseInt(id));
  }
}
