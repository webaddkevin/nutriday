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

export async function getShoppingItems(): Promise<ShoppingItem[]> {
  const res = await request<ShoppingItem[]>({
    url: '/shopping',
    method: 'GET',
  });
  return res.data;
}

export async function getShoppingItemsGrouped(): Promise<Record<string, ShoppingItem[]>> {
  const res = await request<Record<string, ShoppingItem[]>>({
    url: '/shopping/grouped',
    method: 'GET',
  });
  return res.data;
}

export async function createShoppingItem(data: {
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

export async function toggleShoppingItem(id: number): Promise<ShoppingItem> {
  const res = await request<ShoppingItem>({
    url: `/shopping/${id}/toggle`,
    method: 'PUT',
  });
  return res.data;
}

export async function deleteShoppingItem(id: number): Promise<void> {
  await request<void>({
    url: `/shopping/${id}`,
    method: 'DELETE',
  });
}

export async function clearCheckedItems(): Promise<void> {
  await request<void>({
    url: '/shopping/clear/checked',
    method: 'DELETE',
  });
}
