import type dayjs from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

import { forwardRef } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { type TKey, translate, useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

// Thứ tự T2 → CN; dayjs: day() = 0 là Chủ nhật
const WEEKDAY_KEYS: TKey[] = [
  'components.datePicker.weekdays.mon',
  'components.datePicker.weekdays.tue',
  'components.datePicker.weekdays.wed',
  'components.datePicker.weekdays.thu',
  'components.datePicker.weekdays.fri',
  'components.datePicker.weekdays.sat',
  'components.datePicker.weekdays.sun',
];

const weekdayKey = (date: dayjs.Dayjs): TKey => WEEKDAY_KEYS[date.day() === 0 ? 6 : date.day() - 1];

export const formatter = (date: dayjs.Dayjs): string => translate(weekdayKey(date));

type DatePickerFieldProps = {
  error?: boolean;
  helperText?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
} & DatePickerProps;

export const DatePickerField = forwardRef<HTMLInputElement, DatePickerFieldProps>(
  ({ error, helperText, size, fullWidth, ...props }, ref) => {
    const { t } = useTranslate();
    return (
      <DatePicker
        ref={ref}
        label={t('components.datePicker.endDate')}
        dayOfWeekFormatter={(date) => t(weekdayKey(date))}
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
    );
  }
);
