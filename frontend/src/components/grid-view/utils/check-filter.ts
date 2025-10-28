import dayjs from "dayjs";

export function checkFilter(filter: Fields) {
  if (
    typeof filter === 'object' &&
    ['AND', 'OR'].includes(filter.mode) &&
    filter.fields.length > 0 &&
    filter.fields.every((f) => (typeof f.value === 'string' && f.value !== '') || (dayjs.isDayjs(f.value)))
  )
    return true;
  return false;
}

export function RenderFilter(filter: Fields) {
  return JSON.stringify({
    [filter.mode]: filter.fields.map((f) => ({
      [f.key]: {
        [f.operator]: f.value === '_true' ? true : f.value === '_false' ? false : f.value,
      },
    })),
  });
}
