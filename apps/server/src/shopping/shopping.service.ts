import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateShoppingItemDto,
  UpdateShoppingItemDto,
} from './dto/shopping.dto';

@Injectable()
export class ShoppingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 添加购物项
   */
  async create(dto: CreateShoppingItemDto & { userId: number }) {
    return this.prisma.shoppingItem.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        category: dto.category,
        amount: dto.amount || '',
        checked: dto.checked || false,
      },
    });
  }

  /**
   * 获取用户的所有购物项
   */
  async findByUser(userId: number) {
    return this.prisma.shoppingItem.findMany({
      where: { userId },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * 按分类分组获取
   */
  async findByUserGrouped(userId: number) {
    const items = await this.findByUser(userId);
    const groups: Record<string, typeof items> = {};

    for (const item of items) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }

    return groups;
  }

  /**
   * 更新购物项
   */
  async update(id: number, userId: number, dto: UpdateShoppingItemDto) {
    return this.prisma.shoppingItem.update({
      where: { id, userId },
      data: dto,
    });
  }

  /**
   * 切换勾选状态
   */
  async toggleChecked(id: number, userId: number) {
    const item = await this.prisma.shoppingItem.findFirst({
      where: { id, userId },
    });
    if (!item) {
      throw new Error('购物项不存在');
    }
    return this.prisma.shoppingItem.update({
      where: { id },
      data: { checked: !item.checked },
    });
  }

  /**
   * 删除购物项
   */
  async delete(id: number, userId: number) {
    return this.prisma.shoppingItem.delete({
      where: { id, userId },
    });
  }

  /**
   * 清空已勾选项
   */
  async clearChecked(userId: number) {
    return this.prisma.shoppingItem.deleteMany({
      where: { userId, checked: true },
    });
  }

  /**
   * 清空所有
   */
  async clearAll(userId: number) {
    return this.prisma.shoppingItem.deleteMany({
      where: { userId },
    });
  }
}
