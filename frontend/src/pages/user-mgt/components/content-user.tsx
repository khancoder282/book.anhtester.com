import { useWatch, Controller } from 'react-hook-form';

import { Stack, Switch, TextField, useMediaQuery, FormControlLabel } from '@mui/material';

import { textFieldTestId } from 'src/utils/test-id';

import { useTranslate } from 'src/locales';

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
  /**
   * Tiền tố của `id` và `data-testid` các ô nhập: `<prefix>-name`, `<prefix>-email`, `<prefix>-password`...
   * Sign up dùng `register`, profile dùng `profile`, dialog thêm / sửa user dùng `user`.
   */
  testIdPrefix?: string;
};

export function ContentUser({
  isActive = true,
  oldPassword = false,
  isAvatar = true,
  isColumn = false,
  testIdPrefix = 'user',
}: ContentUserProps) {
  const [id, old, pass] = useWatch({
    control: formControl.control,
    name: ['id', 'oldPassword', 'password'],
  });

  const { t } = useTranslate();
  const tid = (field: string) => `${testIdPrefix}-${field}`;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

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
        <LabelBorder>{t('user.form.information')}</LabelBorder>
        {isAvatar && (
          <Controller
            control={formControl.control}
            name="avatar"
            rules={{
              validate: {
                maxBytes: (value) =>
                  !value?.size ||
                  (value instanceof File && value.size < 3 * 1024 * 1024) ||
                  t('user.validation.avatarMaxSize'),
                acceptedFormats: (value) =>
                  !value?.type ||
                  (value instanceof File && checkType(value, accepImg)) ||
                  t('user.validation.avatarFormat'),
              },
            }}
            render={({ field, fieldState: { invalid } }) => (
              <AvatarField
                testId={tid('avatar')}
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
            required: t('user.validation.nameRequired'),
            maxLength: {
              value: 191,
              message: t('user.validation.nameMaxLength'),
            },
            validate: (value) => !value || !!value.trim() || t('user.validation.nameBlank'),
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              id={tid('name')}
              slotProps={textFieldTestId(tid('name'))}
              label={t('user.form.name')}
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
              message: t('user.validation.phoneMaxLength'),
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              id={tid('phone')}
              slotProps={textFieldTestId(tid('phone'))}
              label={t('user.form.phone')}
              error={invalid}
              helperText={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          control={formControl.control}
          name="address"
          defaultValue=""
          rules={{
            maxLength: {
              value: 250,
              message: t('user.validation.addressMaxLength'),
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <AddressField
              id={tid('address')}
              error={invalid}
              helperText={error?.message}
              {...field}
            />
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
            required: t('user.validation.emailRequired'),
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: t('user.validation.emailInvalid'),
            },
            maxLength: {
              value: 191,
              message: t('user.validation.emailMaxLength'),
            },
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <TextField
              id={tid('email')}
              slotProps={textFieldTestId(tid('email'))}
              label={t('user.form.email')}
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
              required: (!!old || !!pass) && t('user.validation.oldPasswordRequired'),
              maxLength: {
                value: 250,
                message: t('user.validation.oldPasswordMaxLength'),
              },
              deps: ['password'],
            }}
            render={({ field, fieldState: { invalid, error } }) => (
              <PasswordField
                id={tid('old-password')}
                label={t('user.form.oldPassword')}
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
            required: (!!old || !id) && t('user.validation.passwordRequired'),
            minLength: {
              value: 6,
              message: t('user.validation.passwordMinLength'),
            },
            maxLength: {
              value: 250,
              message: t('user.validation.passwordMaxLength'),
            },
            deps: ['password_confirmation'],
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <PasswordField
              id={tid('password')}
              label={t('user.form.password')}
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
            required: (!!old || !id) && t('user.validation.passwordConfirmationRequired'),
            maxLength: {
              value: 250,
              message: t('user.validation.passwordConfirmationMaxLength'),
            },
            validate: (value, { password }) =>
              value === password || t('user.validation.passwordConfirmationMismatch'),
          }}
          render={({ field, fieldState: { invalid, error } }) => (
            <PasswordField
              id={tid('password-confirmation')}
              label={t('user.form.passwordConfirmation')}
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
                control={
                  <Switch
                    id={tid('active')}
                    slotProps={{ input: { 'data-testid': tid('active') } as object }}
                  />
                }
                label={
                  field.value ? t('user.form.activeForLogin') : t('user.form.inactiveForLogin')
                }
              />
            )}
          />
        )}
        <LabelBorder>{t('user.form.account')}</LabelBorder>
      </Stack>
    </Stack>
  );
}
