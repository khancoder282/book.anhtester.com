import type { Control, UseFormSetValue } from 'react-hook-form';

import dayjs from 'dayjs';
import { useWatch, Controller } from 'react-hook-form';

import { Box, Stack, Select, MenuItem, TextField, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { DatePickerField } from 'src/components/fields/date-picker-field';

import { TypeField, TypeFieldLabel } from '../config-type';

export function TableFilterItemView<T>({
  index,
  fields,
  control,
  remove,
  isOnly,
  setValue,
  testId = 'table',
}: {
  index: number;
  fields: FieldType<T>[];
  control: Control<Fields, any, Fields>;
  remove: (index: number) => void;
  isOnly: boolean;
  setValue: UseFormSetValue<Fields>;
  testId?: string;
}) {
  const tid = `${testId}-filter`;
  const { t } = useTranslate();
  const size: 'small' | 'medium' = 'medium';
  const [key] = useWatch({
    control,
    name: [`fields.${index}.key`],
  });
  const opt = fields.find((f) => f.name === key);
  const { type, options = [] } = opt as FieldType<T>;
  return (
    <Stack direction="row" spacing={2} alignItems="start">
      <IconButton
        id="remove"
        data-testid={`${tid}-remove-${index}`}
        onClick={() => remove(index)}
        sx={{ alignSelf: 'center' }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>
      {!isOnly &&
        (index === 0 ? (
          <Box minWidth={80} />
        ) : (
          <Controller
            control={control}
            name="mode"
            defaultValue="AND"
            render={({ field }) => (
              <Select
                size={size}
                disabled={index > 1}
                {...field}
                SelectDisplayProps={{ 'data-testid': `${tid}-mode-${index}` } as object}
                sx={{ minWidth: 80, opacity: index > 1 ? 0.4 : 1 }}
              >
                <MenuItem value="AND">{t('components.filter.and')}</MenuItem>
                <MenuItem value="OR">{t('components.filter.or')}</MenuItem>
              </Select>
            )}
          />
        ))}
      <Controller
        control={control}
        name={`fields.${index}.key`}
        defaultValue={fields[0].name as any}
        render={({ field }) => (
          <TextField
            size={size}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              setValue(`fields.${index}.operator`, 'equals');
              setValue(`fields.${index}.value`, '');
            }}
            label={t('components.filter.field')}
            slotProps={{
              select: { SelectDisplayProps: { 'data-testid': `${tid}-field-${index}` } as object },
            }}
            select
            sx={{ maxWidth: 150 }}
            fullWidth
          >
            {fields.map((f) => (
              <MenuItem key={f.name as any} value={f.name as any}>
                {f.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        control={control}
        name={`fields.${index}.operator`}
        render={({ field }) => (
          <TextField
            size={size}
            {...field}
            label={t('components.filter.operator')}
            slotProps={{
              select: {
                SelectDisplayProps: { 'data-testid': `${tid}-operator-${index}` } as object,
              },
            }}
            select
            sx={{ maxWidth: 150 }}
            fullWidth
          >
            {TypeField[type ?? 'string']?.map((op) => (
              <MenuItem key={op} value={op}>
                {t(TypeFieldLabel[op as keyof typeof TypeFieldLabel])}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {type === 'date' && (
        <Controller
          key={`date-${index}`}
          control={control}
          name={`fields.${index}.value`}
          defaultValue={dayjs()}
          rules={{ required: true }}
          render={({ field, fieldState: { invalid } }) => (
            <DatePickerField
              size={size}
              error={invalid}
              {...field}
              label={t('components.filter.value')}
              testId={`${tid}-value-${index}`}
              value={dayjs.isDayjs(field.value) ? field.value : null}
              fullWidth
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      )}
      {type === 'enums' && (
        <Controller
          key={`enums-${index}`}
          control={control}
          name={`fields.${index}.value`}
          defaultValue={options[0]}
          rules={{ required: true }}
          render={({ field, fieldState: { invalid } }) => (
            <TextField
              size={size}
              {...field}
              label={t('components.filter.value')}
              slotProps={{
                select: {
                  SelectDisplayProps: { 'data-testid': `${tid}-value-${index}` } as object,
                },
              }}
              error={invalid}
              select
              fullWidth
            >
              {options.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
      {type === 'string' && (
        <Controller
          key={`string-${index}`}
          control={control}
          name={`fields.${index}.value`}
          defaultValue=""
          rules={{ required: true }}
          render={({ field, fieldState: { invalid } }) => (
            <TextField
              size={size}
              {...field}
              label={t('components.filter.value')}
              slotProps={{ htmlInput: { 'data-testid': `${tid}-value-${index}` } }}
              fullWidth
              error={invalid}
            />
          )}
        />
      )}
      {type === 'boolean' && (
        <Controller
          key={`boolean-${index}`}
          control={control}
          name={`fields.${index}.value`}
          defaultValue="_true"
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              select
              size={size}
              {...field}
              label={t('components.filter.value')}
              slotProps={{
                select: {
                  SelectDisplayProps: { 'data-testid': `${tid}-value-${index}` } as object,
                },
              }}
              error={invalid}
              fullWidth
              helperText={error?.message}
            >
              <MenuItem value="_true">{t('components.filter.true')}</MenuItem>
              <MenuItem value="_false">{t('components.filter.false')}</MenuItem>
            </TextField>
          )}
        />
      )}
    </Stack>
  );
}
