import dayjs from 'dayjs';
import { useWatch, Controller, type Control } from 'react-hook-form';

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
}: {
  index: number;
  fields: FieldType<T>[];
  control: Control<Fields, any, Fields>;
  remove: (index: number) => void;
  isOnly: boolean;
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
          <TextField size={size} {...field} label="Field" select sx={{ maxWidth: 150 }} fullWidth>
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
        defaultValue="equals"
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

      <Controller
        control={control}
        name={`fields.${index}.value`}
        defaultValue={type === 'enums' ? options[0] : ''}
        rules={{ required: true }}
        render={({ field, fieldState: { invalid } }) =>
          type === 'date' ? (
            <DatePickerField
              size={size}
              error={invalid}
              {...field}
              label="Value"
              value={dayjs(field.value || null)}
              fullWidth
              onChange={(v) => field.onChange(v?.toISOString())}
            />
          ) : (
            <TextField
              size={size}
              {...field}
              label="Value"
              fullWidth
              error={invalid}
              slotProps={{ inputLabel: { shrink: true } }}
              select={type === 'enums'}
            >
              {options.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          )
        }
      />
    </Stack>
  );
}
