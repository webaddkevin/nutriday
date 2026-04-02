import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import {
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';
import { UserId } from '../common/decorators/user.decorator';

@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  async create(@UserId() userId: number, @Body() dto: CreateShoppingItemDto) {
    return this.shoppingService.create({ ...dto, userId });
  }

  @Get()
  async findByUser(@UserId() userId: number) {
    return this.shoppingService.findByUser(userId);
  }

  @Get('grouped')
  async findByUserGrouped(@UserId() userId: number) {
    return this.shoppingService.findByUserGrouped(userId);
  }

  @Put(':id')
  async update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return this.shoppingService.update(id, userId, dto);
  }

  @Put(':id/toggle')
  async toggleChecked(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.shoppingService.toggleChecked(id, userId);
  }

  @Delete(':id')
  async delete(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.shoppingService.delete(id, userId);
  }

  @Delete('clear/checked')
  async clearChecked(@UserId() userId: number) {
    return this.shoppingService.clearChecked(userId);
  }

  @Delete('clear/all')
  async clearAll(@UserId() userId: number) {
    return this.shoppingService.clearAll(userId);
  }
}
