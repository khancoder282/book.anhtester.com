import { useState, forwardRef } from 'react';

import { TextField, IconButton, InputAdornment, type TextFieldProps } from '@mui/material';

import { Iconify } from '../iconify';

type PasswordFieldProps = TextFieldProps;

export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <TextField
        ref={ref}
        {...props}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  }
);
