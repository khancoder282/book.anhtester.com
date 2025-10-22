export function checkFilter(filter: Fields) {
  if (
    typeof filter === 'object' &&
    ['AND', 'OR'].includes(filter.mode) &&
    filter.fields.length > 0 &&
    filter.fields.every((f) => f.key.length > 0 && f.value.length > 0 && f.operator.length > 0)
  )
    return true;
  return false;
}

export function RenderFilter(filter: Fields) {
  return JSON.stringify({
    [filter.mode]: filter.fields.map((f) => ({
      [f.key]: {
        [f.operator]: f.value,
      },
    })),
  });
}
