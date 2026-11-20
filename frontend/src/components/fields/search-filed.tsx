import type { TextFieldProps } from '@mui/material';

import { useDebounce } from 'minimal-shared/hooks';
import { useRef, useState, useEffect } from 'react';

import { TextField, IconButton, InputAdornment } from '@mui/material';

import { Iconify } from '../iconify';
import { searchInputProps } from './search-input-props';

type SearchFieldProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
  /** data-testid của ô tìm (mặc định 'search'); nút xoá có `<testId>-clear` */
  testId?: string;
};

export function SearchField({
  value,
  onChange,
  sx,
  testId = 'search',
  ...props
}: SearchFieldProps) {
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
        ...props.slotProps,
        htmlInput: {
          ...searchInputProps,
          'data-testid': testId,
          ...(props.slotProps?.htmlInput as object),
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" />
            </InputAdornment>
          ),
          endAdornment: s && (
            <InputAdornment position="end">
              <IconButton data-testid={`${testId}-clear`} onClick={() => onChange('')}>
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
