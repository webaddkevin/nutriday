import { request } from '../utils/request';

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

export async function getShoppingItems(userId: number): Promise<ShoppingItem[]> {
  const res = await request<ShoppingItem[]>({
    url: `/shopping?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

export async function getShoppingItemsGrouped(
  userId: number,
): Promise<Record<string, ShoppingItem[]>> {
  const res = await request<Record<string, ShoppingItem[]>>({
    url: `/shopping/grouped?userId=${userId}`,
    method: 'GET',
  });
  return res.data;
}

export async function createShoppingItem(data: {
  userId: number;
  name: string;
  category: string;
  amount?: string;
}): Promise<ShoppingItem> {
  const res = await request<ShoppingItem>({
    url: '/shopping',
    method: 'POST',
    data,
  });
  return res.data;
}

export async function toggleShoppingItem(id: number, userId: number): Promise<ShoppingItem> {
  const res = await request<ShoppingItem>({
    url: `/shopping/${id}/toggle?userId=${userId}`,
    method: 'PUT',
  });
  return res.data;
}

export async function deleteShoppingItem(id: number, userId: number): Promise<void> {
  await request<void>({
    url: `/shopping/${id}?userId=${userId}`,
    method: 'DELETE',
  });
}

export async function clearCheckedItems(userId: number): Promise<void> {
  await request<void>({
    url: `/shopping/clear/checked?userId=${userId}`,
    method: 'DELETE',
  });
}
