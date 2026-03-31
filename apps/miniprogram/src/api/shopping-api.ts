import { request } from '../utils/request';
import { requireUserId } from '@/utils/user';

export interface ShoppingItem {
  id: number;
  userId: number;
  name: string;
  category: string;
  amount: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const userId = requireUserId();
  const res = await request<ShoppingItem[]>({
    url: `/shopping?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

export async function getShoppingItemsGrouped(): Promise<Record<string, ShoppingItem[]>> {
  const userId = requireUserId();
  const res = await request<Record<string, ShoppingItem[]>>({
    url: `/shopping/grouped?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

export async function createShoppingItem(data: {
  name: string;
  category: string;
  amount?: string;
}): Promise<ShoppingItem> {
  const userId = requireUserId();
  const res = await request<ShoppingItem>({
    url: '/shopping',
    method: 'POST',
    data: { ...data, userId },
  });
  return res.data;
}

export async function toggleShoppingItem(id: number): Promise<ShoppingItem> {
  const userId = requireUserId();
  const res = await request<ShoppingItem>({
    url: `/shopping/${id}/toggle?userId=${userId}`,
    method: 'PUT',
  });
  return res.data;
}

export async function deleteShoppingItem(id: number): Promise<void> {
  const userId = requireUserId();
  await request<void>({
    url: `/shopping/${id}?userId=${userId}`,
    method: 'DELETE',
  });
}

export async function clearCheckedItems(): Promise<void> {
  const userId = requireUserId();
  await request<void>({
    url: `/shopping/clear/checked?userId=${userId}`,
    method: 'DELETE',
  });
}
