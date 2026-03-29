import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { BarcodeService } from './barcode.service';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  /**
   * 查询条码信息
   */
  @Get(':code')
  async lookup(@Param('code') code: string) {
    const foodInfo = await this.barcodeService.lookupByBarcode(code);
    if (!foodInfo) {
      return {
        success: false,
        message: '未找到该条码对应的食品信息',
        data: null,
      };
    }
    return {
      success: true,
      data: foodInfo,
    };
  }

  /**
   * 保存条码食品到本地数据库
   */
  @Post('save')
  async save(
    @Body('barcode') barcode: string,
    @Body('name') name: string,
    @Body('calories') calories: number,
    @Body('protein') protein: number,
    @Body('carbs') carbs: number,
    @Body('fat') fat: number,
    @Body('brand') brand?: string,
    @Body('category') category?: string,
    @Body('fiber') fiber?: number,
    @Body('sodium') sodium?: number,
    @Body('servingSize') servingSize?: number,
    @Body('unit') unit?: string,
    @Body('imageUrl') imageUrl?: string,
  ) {
    const result = await this.barcodeService.saveFood({
      barcode,
      name,
      brand,
      category: category || '其他',
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sodium,
      servingSize: servingSize || 100,
      unit: unit || 'g',
      imageUrl,
      source: 'user',
    });

    return {
      success: true,
      data: result,
    };
  }
}
