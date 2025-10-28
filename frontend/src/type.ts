import type dayjs from 'dayjs';
import type { Theme, SxProps } from '@mui/material';

declare global {
  type Sx = SxProps<Theme>;
  type Dayjs = dayjs.Dayjs
}

export { };
