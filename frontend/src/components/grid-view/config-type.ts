export const TypeField: Record<string, string[]> = {
  string: ['equals', 'not', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'lt', 'lte', 'gt', 'gte', 'not'],
  date: ['equals', 'lt', 'lte', 'gt', 'gte', 'not'],
  boolean: ['equals', 'not'],
  enums: ['equals', 'not'],
};

export const TypeFieldLabel = {
  equals: 'Equals (=)',
  not: 'Not equal to (!=)',
  lt: 'Less than (<)',
  lte: 'Less than or equal to (<=)',
  gt: 'Greater than (>)',
  gte: 'Greater than or equal to (>=)',
  contains: 'Contains (∈)',
  startsWith: 'Starts with (→)',
  endsWith: 'Ends with (←)',
};
