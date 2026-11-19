import type { TextFieldProps } from '@mui/material';

import { useState } from 'react';

import { Box, TextField, Autocomplete, ClickAwayListener } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

/** Ô trống / không phải số → `null` (bỏ điều kiện), không phải `0`. */
const toNumberOrNull = (v: string | number | null): number | null => {
  if (v === null || (typeof v === 'string' && v.trim() === '')) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

type FromToFieldProps = Omit<TextFieldProps, 'value' | 'onChange' | 'defaultValue'> & {
  value: { from: number | null; to: number | null };
  onChange: (value: { from: number | null; to: number | null }) => void;
  options?: number[];
};

export function FromToField({
  value = { from: null, to: null },
  onChange,
  options,
}: FromToFieldProps) {
  const { t } = useTranslate();
  const [isForcus, setIsForcus] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => isForcus && setIsForcus(false)}>
      <Box
        onClick={() => setIsForcus(true)}
        display="flex"
        gap={2}
        alignItems="center"
        sx={{
          height: 56,
          px: 0.5,
          transition: 'all .1s ease-in-out',
          outline: isForcus ? 2 : 1,
          outlineColor: 'divider',
          '&:hover': {
            outlineColor: 'text.primary',
          },
          borderRadius: 1,
        }}
      >
        <Autocomplete
          fullWidth
          freeSolo
          options={options || []}
          size="small"
          value={value.from}
          onChange={(_, v) => onChange({ ...value, from: toNumberOrNull(v) })}
          getOptionLabel={(option) => option.toString()} // Convert number to string
          renderInput={(p) => (
            <TextField
              {...p}
              type="number"
              placeholder={t('components.fromTo.priceFrom')}
              sx={{
                '& fieldset': { border: 'none' },
              }}
            />
          )}
          renderOption={(p, v) => (
            <li {...p} key={p.key}>
              {new Intl.NumberFormat('vi-VN').format(v)}
            </li>
          )}
        />
        <Iconify icon="solar:arrow-right-linear" />
        <Autocomplete
          fullWidth
          freeSolo
          options={options || []}
          value={value.to}
          onChange={(_, v) => onChange({ ...value, to: toNumberOrNull(v) })}
          size="small"
          getOptionLabel={(option) => option.toString()} // Convert number to string
          renderInput={(p) => (
            <TextField
              {...p}
              type="number"
              placeholder={t('components.fromTo.priceTo')}
              sx={{
                '& fieldset': { border: 'none' },
              }}
            />
          )}
          renderOption={(p, v) => (
            <li {...p} key={p.key}>
              {new Intl.NumberFormat('vi-VN').format(v)}
            </li>
          )}
        />
      </Box>
    </ClickAwayListener>
  );
}
