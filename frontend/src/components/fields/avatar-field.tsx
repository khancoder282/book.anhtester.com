import { forwardRef } from 'react';

import { Avatar, FormControl } from '@mui/material';

type AvatarFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
};
export const AvatarField = forwardRef<HTMLDivElement, AvatarFieldProps>((props, ref) => (
  <FormControl>
    <Avatar />
  </FormControl>
));
