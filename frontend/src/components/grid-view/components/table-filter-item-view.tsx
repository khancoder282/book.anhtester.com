import type { Control, UseFormSetValue } from 'react-hook-form';

import dayjs from 'dayjs';
import { useWatch, Controller } from 'react-hook-form';

import { Box, Stack, Select, MenuItem, TextField, IconButton } from '@mui/material';

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
}: {
  index: number;
  fields: FieldType<T>[];
  control: Control<Fields, any, Fields>;
  remove: (index: number) => void;
  isOnly: boolean;
  setValue: UseFormSetValue<Fields>;
}) {
  const size: 'small' | 'medium' = 'medium';
  const [key] = useWatch({
    control,
    name: [`fields.${index}.key`],
  });
  const opt = fields.find((f) => f.name === key);
  const { type, options = [] } = opt as FieldType<T>;
  return (
    <Stack direction="row" spacing={2} alignItems="start">
      <IconButton id="remove" onClick={() => remove(index)} sx={{ alignSelf: 'center' }}>
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
                sx={{ minWidth: 80, opacity: index > 1 ? 0.4 : 1 }}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
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
            label="Field"
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
            label="Operator"
            select
            sx={{ maxWidth: 150 }}
            fullWidth
          >
            {TypeField[type ?? 'string']?.map((t) => (
              <MenuItem key={t} value={t}>
                {TypeFieldLabel[t as keyof typeof TypeFieldLabel]}
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
              label="Value"
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
            <TextField size={size} {...field} label="Value" error={invalid} select fullWidth>
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
              label="Value"
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
              label="Value"
              error={invalid}
              fullWidth
              helperText={error?.message}
            >
              <MenuItem value="_true">True</MenuItem>
              <MenuItem value="_false">False</MenuItem>
            </TextField>
          )}
        />
      )}
    </Stack>
  );
}
