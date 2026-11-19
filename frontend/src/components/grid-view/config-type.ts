import type { TKey } from 'src/locales';

export const TypeField: Record<string, string[]> = {
  string: ['equals', 'not', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'lt', 'lte', 'gt', 'gte', 'not'],
  date: ['equals', 'lt', 'lte', 'gt', 'gte', 'not'],
  boolean: ['equals', 'not'],
  enums: ['equals', 'not'],
};

/** Khoá dịch của nhãn toán tử lọc, dịch lúc render bằng `t()` */
export const TypeFieldLabel = {
  equals: 'components.filter.operators.equals',
  not: 'components.filter.operators.not',
  lt: 'components.filter.operators.lt',
  lte: 'components.filter.operators.lte',
  gt: 'components.filter.operators.gt',
  gte: 'components.filter.operators.gte',
  contains: 'components.filter.operators.contains',
  startsWith: 'components.filter.operators.startsWith',
  endsWith: 'components.filter.operators.endsWith',
} satisfies Record<string, TKey>;
