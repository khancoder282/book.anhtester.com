import { useWatch, Controller } from 'react-hook-form';

import { Stack, Switch, Divider, TextField, FormControlLabel } from '@mui/material';

import { PasswordField } from 'src/components/fields/password-field';

import { formControl } from '../store/form';

export function ContentUser() {
  const [id] = useWatch({ control: formControl.control, name: ['id'] });

  return (
    <Stack spacing={2}>
      <Controller
        control={formControl.control}
        name="name"
        defaultValue=""
        rules={{
          required: 'Name is required.',
          maxLength: {
            value: 250,
            message: 'Name must be less than 250 characters.',
          },
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField label="Name" error={invalid} helperText={error?.message} required {...field} />
        )}
      />
      <Controller
        control={formControl.control}
        name="phone"
        defaultValue=""
        render={({ field }) => <TextField label="Phone" {...field} />}
      />
      <Controller
        control={formControl.control}
        name="address"
        defaultValue=""
        render={({ field }) => <TextField label="Address" {...field} />}
      />
      <Divider>Login info</Divider>
      <Controller
        control={formControl.control}
        name="email"
        defaultValue=""
        rules={{
          required: 'Email is required.',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
          maxLength: {
            value: 250,
            message: 'Email must be less than 250 characters.',
          },
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <TextField
            label="Email"
            error={invalid}
            helperText={error?.message}
            required
            {...field}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="password"
        defaultValue=""
        rules={{
          required: id ? false : 'Password is required.',
          maxLength: {
            value: 250,
            message: 'Password must be less than 250 characters.',
          },
          deps: ['password_confirmation'],
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <PasswordField
            label="Password"
            error={invalid}
            helperText={error?.message}
            required={!id}
            {...field}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="password_confirmation"
        defaultValue=""
        rules={{
          required: id ? false : 'Password confirmation is required.',
          maxLength: {
            value: 250,
            message: 'Password confirmation must be less than 250 characters.',
          },
          validate: (value, { password }) =>
            value === password || 'Password confirmation does not match.',
        }}
        render={({ field, fieldState: { invalid, error } }) => (
          <PasswordField
            label="Password Confirmation"
            error={invalid}
            helperText={error?.message}
            required={!id}
            {...field}
          />
        )}
      />
      <Controller
        control={formControl.control}
        name="isActive"
        defaultValue={false}
        render={({ field }) => (
          <FormControlLabel
            {...field}
            checked={field.value}
            control={<Switch />}
            label={field.value ? 'Active for login' : 'Inactive for login'}
          />
        )}
      />
    </Stack>
  );
}
