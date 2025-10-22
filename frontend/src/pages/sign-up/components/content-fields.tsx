import { Controller } from 'react-hook-form';

import { Stack, TextField } from '@mui/material';

import { PasswordField } from 'src/components/fields/password-field';

import { formControl } from '../store/store-fields-register';

export function ContentFields() {
  return (
    <Stack spacing={3} width={1} mb={3}>
      <Controller
        control={formControl.control}
        name="name"
        defaultValue=""
        rules={{
          required: 'Name is require',
          maxLength: {
            value: 250,
            message: 'Name must be less than 250 characters.',
          },
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            fullWidth
            required
            {...field}
            label="Full name"
            multiline
            error={invalid}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="email"
        defaultValue=""
        rules={{
          required: 'Email is required.',
          maxLength: {
            value: 250,
            message: 'Email must be less than 250 characters.',
          },
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address.',
          },
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            fullWidth
            required
            {...field}
            label="Email address"
            error={invalid}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="password"
        defaultValue=""
        rules={{
          required: 'Password is required.',
          maxLength: {
            value: 250,
            message: 'Password must be less than 250 characters.',
          },
          deps: ['password_confirmation'],
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <PasswordField
            fullWidth
            required
            {...field}
            label="Password"
            error={invalid}
            helperText={error?.message}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="password_confirmation"
        defaultValue=""
        rules={{
          required: 'Password confirmation is required.',
          maxLength: {
            value: 250,
            message: 'Password must be less than 250 characters.',
          },
          validate: (value, { password }) =>
            value === password || 'Password confirmation does not match.',
        }}
        render={({ field, fieldState: { error, invalid } }) => (
          <PasswordField
            fullWidth
            required
            {...field}
            label="Password confirmation"
            error={invalid}
            helperText={error?.message}
          />
        )}
      />
    </Stack>
  );
}
