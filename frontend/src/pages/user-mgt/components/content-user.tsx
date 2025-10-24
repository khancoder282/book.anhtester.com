import { useWatch, Controller } from 'react-hook-form';

import { Stack, Switch, TextField, useMediaQuery, FormControlLabel } from '@mui/material';

import { LabelBorder } from 'src/components/label/label-border';
import { AvatarField } from 'src/components/fields/avatar-field';
import { AddressField } from 'src/components/fields/address-field';
import { PasswordField } from 'src/components/fields/password-field';
import { accepImg, checkType } from 'src/components/fields/upload-field';

import { formControl } from '../store/form';

type ContentUserProps = {
  isActive?: boolean;
  oldPassword?: boolean;
  isAvatar?: boolean;
  isColumn?: boolean;
};

export function ContentUser({
  isActive = true,
  oldPassword = false,
  isAvatar = true,
  isColumn = false,
}: ContentUserProps) {
  const [id, old, pass] = useWatch({
    control: formControl.control,
    name: ['id', 'oldPassword', 'password'],
  });

  const isMobile = useMediaQuery((t) => t.breakpoints.down('md'));

  return (
    <Stack
      spacing={3}
      direction={isColumn ? 'column' : isMobile ? 'column' : 'row'}
      alignItems="start"
    >
      <Stack
        sx={{
          p: 3,
          gap: 2,
          width: 1,
          border: 1,
          borderRadius: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          position: 'relative',
        }}
      >
        <LabelBorder>Infomation</LabelBorder>
        {isAvatar && (
          <Controller
            control={formControl.control}
            name="avatar"
            rules={{
              validate: {
                maxBytes: (value) =>
                  !value?.size ||
                  (value instanceof File && value.size < 3 * 1024 * 1024) ||
                  'Avatar size must be less than 3MB.',
                acceptedFormats: (value) =>
                  !value?.type ||
                  (value instanceof File && checkType(value, accepImg)) ||
                  'Avatar format must be *.jpeg, *.jpg, *.png, *.gif.',
              },
            }}
            render={({ field, fieldState: { invalid } }) => (
              <AvatarField
                error={invalid}
                {...field}
                opt={{ maxSize: 1024 * 1024 * 3, maxFiles: 1 }}
              />
            )}
          />
        )}
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
            <TextField
              label="Name"
              error={invalid}
              helperText={error?.message}
              required
              {...field}
            />
          )}
        />
        <Controller
          control={formControl.control}
          name="phone"
          defaultValue=""
          rules={{
            maxLength: {
              value: 10,
              message: 'Max length for number phone is 10 number.',
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField label="Phone" error={invalid} helperText={error?.message} {...field} />
          )}
        />
        <Controller
          control={formControl.control}
          name="address"
          defaultValue=""
          rules={{
            maxLength: {
              value: 250,
              message: 'Max length for address is 250 characters.',
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <AddressField error={invalid} helperText={error?.message} {...field} />
          )}
        />
      </Stack>

      <Stack
        sx={{
          p: 3,
          gap: 2,
          width: 1,
          border: 1,
          borderRadius: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          position: 'relative',
        }}
      >
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
        {oldPassword && (
          <Controller
            control={formControl.control}
            name="oldPassword"
            defaultValue=""
            rules={{
              required: (!!old || !!pass) && 'Old Password is required.',
              maxLength: {
                value: 250,
                message: 'Old Password must be less than 250 characters.',
              },
              deps: ['password'],
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <PasswordField
                label="Old Password"
                error={invalid}
                helperText={error?.message}
                required={!!old || !!pass}
                {...field}
              />
            )}
          />
        )}
        <Controller
          control={formControl.control}
          name="password"
          defaultValue=""
          rules={{
            required: (!!old || !id) && 'Password is required.',
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
              required={!!old || !id}
              {...field}
            />
          )}
        />
        <Controller
          control={formControl.control}
          name="password_confirmation"
          defaultValue=""
          rules={{
            required: (!!old || !id) && 'Password confirmation is required.',
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
              required={!!old || !id}
              {...field}
            />
          )}
        />
        {isActive && (
          <Controller
            control={formControl.control}
            name="isActive"
            defaultValue
            render={({ field }) => (
              <FormControlLabel
                {...field}
                checked={field.value}
                control={<Switch />}
                label={field.value ? 'Active for login' : 'Inactive for login'}
              />
            )}
          />
        )}
        <LabelBorder>Account</LabelBorder>
      </Stack>
    </Stack>
  );
}
