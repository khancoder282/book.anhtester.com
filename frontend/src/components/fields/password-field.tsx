import { create } from 'zustand';
import { useEffect, forwardRef } from 'react';

import { TextField, IconButton, InputAdornment, type TextFieldProps } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

type PasswordFieldProps = TextFieldProps & {
  /**
   * `data-testid` của ô nhập. Nút ẩn/hiện mật khẩu có `<testId>-toggle`.
   * Mặc định lấy theo `id`.
   */
  testId?: string;
};

const usePassword = create<{
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
}>((set) => ({
  showPassword: false,
  setShowPassword: (showPassword: boolean) => set({ showPassword }),
}));
export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  function PasswordFieldInner({ testId, slotProps, ...props }, ref) {
    const { showPassword, setShowPassword } = usePassword();
    const { t } = useTranslate();
    useEffect(() => () => {
      if (showPassword) setShowPassword(false);
    });
    const tid = testId ?? props.id;
    return (
      <TextField
        ref={ref}
        {...props}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          ...slotProps,
          htmlInput: {
            ...(slotProps?.htmlInput as object),
            ...(tid && { 'data-testid': tid }),
          },
          formHelperText: {
            ...(slotProps?.formHelperText as object),
            ...(tid && { 'data-testid': `${tid}-error` }),
          },
          input: {
            ...(slotProps?.input as object),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label={t(
                    showPassword ? 'components.password.hide' : 'components.password.show'
                  )}
                  {...(tid && { 'data-testid': `${tid}-toggle` })}
                >
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
