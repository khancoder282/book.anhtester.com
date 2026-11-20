import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type QuantityInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'small' | 'medium';
  /** Tiền tố data-testid: `<id>-decrease`, `<id>-input`, `<id>-increase` */
  testId?: string;
  label?: string;
};

/** Ô số lượng [-] n [+]: gõ trực tiếp được, rời ô thì tự kẹp về [min, max]. */
export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  size = 'medium',
  testId = 'quantity',
  label,
}: QuantityInputProps) {
  const { t } = useTranslate();
  const [text, setText] = useState(String(value));
  const h = size === 'small' ? 34 : 42;

  useEffect(() => setText(String(value)), [value]);

  const commit = (raw: string) => {
    const n = Math.min(Math.max(parseInt(raw, 10) || min, min), max);
    setText(String(n));
    if (n !== value) onChange(n);
  };

  const btn = { width: h, height: h, borderRadius: 0, color: 'text.secondary' } as const;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: h,
        borderRadius: '11px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: 'inset 0 0 0 1.5px var(--at-line)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <IconButton
        sx={btn}
        disabled={disabled || value <= min}
        aria-label={t('shop.cart.decrease')}
        data-testid={`${testId}-decrease`}
        onClick={() => onChange(Math.max(value - 1, min))}
      >
        <Iconify icon="eva:minus-fill" width={18} />
      </IconButton>
      <Box
        component="input"
        type="text"
        inputMode="numeric"
        aria-label={label ?? t('shop.cart.quantity')}
        data-testid={`${testId}-input`}
        disabled={disabled}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setText(e.target.value.replace(/\D/g, '').slice(0, 3))
        }
        onBlur={(e: React.FocusEvent<HTMLInputElement>) => commit(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
        sx={{
          width: 44,
          height: 1,
          border: 0,
          outline: 0,
          p: 0,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 15,
          color: 'text.primary',
          bgcolor: 'transparent',
          fontFamily: 'inherit',
        }}
      />
      <IconButton
        sx={btn}
        disabled={disabled || value >= max}
        aria-label={t('shop.cart.increase')}
        data-testid={`${testId}-increase`}
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        <Iconify icon="eva:plus-fill" width={18} />
      </IconButton>
    </Box>
  );
}
