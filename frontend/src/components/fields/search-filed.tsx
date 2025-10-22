import type { TextFieldProps } from '@mui/material';

import { useDebounce } from 'minimal-shared/hooks';
import { useRef, useState, useEffect } from 'react';

import { TextField, IconButton, InputAdornment } from '@mui/material';

import { Iconify } from '../iconify';

type SearchFieldProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ value, onChange, sx, ...props }: SearchFieldProps) {
  const flag = useRef(false);
  const [s, setS] = useState('');

  const search = useDebounce(s, 500);

  useEffect(() => {
    if (search !== value) {
      if (flag.current) {
        flag.current = false;
        onChange(search);
      } else {
        setS(value);
      }
    }
  }, [onChange, s, search, value]);

  return (
    <TextField
      {...props}
      fullWidth
      sx={{
        maxWidth: 300,
        ...sx,
      }}
      value={s}
      onChange={(e) => {
        flag.current = true;
        setS(e.target.value);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" />
            </InputAdornment>
          ),
          endAdornment: s && (
            <InputAdornment position="end">
              <IconButton onClick={() => onChange('')}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
