import type dayjs from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

import { forwardRef } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from '../iconify';

export const formatter = (date: dayjs.Dayjs): string => {
  const days: string[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dayIndex: number = date.day() === 0 ? 6 : date.day() - 1;
  return days[dayIndex];
};

type DatePickerFieldProps = {
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
} & DatePickerProps;

export const DatePickerField = forwardRef<HTMLInputElement, DatePickerFieldProps>(
  ({ error, helperText, size, fullWidth, ...props }, ref) => (
    <DatePicker
      ref={ref}
      label="End date"
      dayOfWeekFormatter={formatter}
      {...props}
      slots={{
        openPickerIcon: () => <Iconify icon="solar:calendar-minimalistic-bold" />,
      }}
      slotProps={{
        textField: {
          error,
          size,
          fullWidth,
          helperText,
        },
      }}
    />
  )
);
