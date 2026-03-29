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
import { ShoppingService } from './shopping.service';
import {
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';

@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  create(@Body() dto: CreateShoppingItemDto) {
    return this.shoppingService.create(dto);
  }

  @Get()
  findByUser(@Query('userId', ParseIntPipe) userId: number) {
    return this.shoppingService.findByUser(userId);
  }

  @Get('grouped')
  findByUserGrouped(@Query('userId', ParseIntPipe) userId: number) {
    return this.shoppingService.findByUserGrouped(userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateShoppingItemDto,
  ) {
    return this.shoppingService.update(id, userId, dto);
  }

  @Put(':id/toggle')
  toggleChecked(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.shoppingService.toggleChecked(id, userId);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.shoppingService.delete(id, userId);
  }

  @Delete('clear/checked')
  clearChecked(@Query('userId', ParseIntPipe) userId: number) {
    return this.shoppingService.clearChecked(userId);
  }

  @Delete('clear/all')
  clearAll(@Query('userId', ParseIntPipe) userId: number) {
    return this.shoppingService.clearAll(userId);
  }
}
