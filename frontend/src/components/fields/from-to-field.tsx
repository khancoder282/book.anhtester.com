import type { TextFieldProps } from '@mui/material';

import { useState } from 'react';

import { Box, TextField, Autocomplete, ClickAwayListener } from '@mui/material';

import { Iconify } from '../iconify';

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
          defaultValue={value.from}
          value={value.from}
          onChange={(_, v) => onChange({ ...value, from: Number(v) })}
          getOptionLabel={(option) => option.toString()} // Convert number to string
          renderInput={(p) => (
            <TextField
              {...p}
              type="number"
              placeholder="Price from"
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
          defaultValue={value.to} // Changed from value.from to value.to
          value={value.to}
          onChange={(_, v) => onChange({ ...value, to: Number(v) })}
          size="small"
          getOptionLabel={(option) => option.toString()} // Convert number to string
          renderInput={(p) => (
            <TextField
              {...p}
              type="number"
              placeholder="Price to"
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
