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
import { ShoppingService } from './shopping.service';
import {
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';
import { AuthService } from '../auth/auth.service';

@Controller('shopping')
export class ShoppingController {
  constructor(
    private readonly shoppingService: ShoppingService,
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
    @Body() dto: CreateShoppingItemDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.create({ ...dto, userId });
  }

  @Get()
  async findByUser(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.findByUser(userId);
  }

  @Get('grouped')
  async findByUserGrouped(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.findByUserGrouped(userId);
  }

  @Put(':id')
  async update(
    @Headers('authorization') authorization: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.update(id, userId, dto);
  }

  @Put(':id/toggle')
  async toggleChecked(
    @Headers('authorization') authorization: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.toggleChecked(id, userId);
  }

  @Delete(':id')
  async delete(
    @Headers('authorization') authorization: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.delete(id, userId);
  }

  @Delete('clear/checked')
  async clearChecked(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.clearChecked(userId);
  }

  @Delete('clear/all')
  async clearAll(@Headers('authorization') authorization: string) {
    const userId = await this.extractUserId(authorization);
    return this.shoppingService.clearAll(userId);
  }
}
