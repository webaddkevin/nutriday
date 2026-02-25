/**
 * Nutriday 共享工具函数
 * 所有跨应用共享的工具函数在此统一导出
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date - 日期对象或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 判断值是否为空（null、undefined、空字符串、空数组）
 * @param value - 待检查的值
 * @returns 是否为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}
