import type { ButtonProps, DialogProps, SwitchProps, TextFieldProps } from '@mui/material';
import type { FieldValues, RegisterOptions, ControllerRenderProps } from 'react-hook-form';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { useDialog } from './store';

type ObjectField<T = string> =
  | {
      type: 'text';
      label: string;
      defaultValue: string;
      options?: never;
      rules?: Omit<
        RegisterOptions<FieldValues, string>,
        'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
      >;
      props?: TextFieldProps;
      render?: never;
    }
  | {
      type: 'checkbox';
      label: string;
      defaultValue: boolean;
      options?: never;
      rules?: Omit<
        RegisterOptions<FieldValues, string>,
        'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
      >;
      props?: SwitchProps;
      render?: never;
    }
  | {
      type: 'select';
      label: string;
      defaultValue: T;
      options: { value: T; label: React.ReactNode }[];
      rules?: Omit<
        RegisterOptions<FieldValues, string>,
        'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
      >;
      props?: TextFieldProps;
      render?: never;
    }
  | {
      type: 'custom';
      defaultValue: any;
      label?: never;
      options?: never;
      rules?: Omit<
        RegisterOptions<FieldValues, string>,
        'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
      >;
      props?: never;
      render: (
        opt: ObjectField,
        field: ControllerRenderProps<FieldValues, string>,
        inValid: boolean,
        message?: string
      ) => React.ReactNode;
    };

export type DialogConfirmFormProps<T = any> = {
  title: React.ReactNode;
  body: Record<keyof T, ObjectField | React.ReactNode>;
  action: {
    onAction: (data: Record<string, any>) => Promise<void> | void;
    label?: React.ReactNode;
  } & ButtonProps;

  props?: DialogProps;
};

const mapping = {
  checkbox: (
    opt: ObjectField,
    field: ControllerRenderProps<FieldValues, string>,
    inValid: boolean,
    helperText?: string
  ) => (
    <Stack spacing={1}>
      <FormControlLabel
        required={!!opt.rules?.required}
        color={inValid ? 'error.main' : 'inherit'}
        {...field}
        control={<Switch {...(opt.props as SwitchProps)} color={inValid ? 'error' : 'primary'} />}
        label={opt.label}
      />
      {helperText && (
        <FormHelperText sx={{ px: 1 }} error={inValid}>
          {helperText}
        </FormHelperText>
      )}
    </Stack>
  ),
  text: (
    opt: ObjectField,
    field: ControllerRenderProps<FieldValues, string>,
    inValid: boolean,
    helperText?: string
  ) => (
    <TextField
      {...field}
      {...(opt.props as TextFieldProps)}
      label={opt.label}
      error={inValid}
      helperText={helperText}
      required={!!opt.rules?.required}
    />
  ),
  select: (
    opt: ObjectField,
    field: ControllerRenderProps<FieldValues, string>,
    inValid: boolean,
    helperText?: string
  ) => (
    <TextField
      {...field}
      {...(opt.props as TextFieldProps)}
      select
      label={opt.label}
      error={inValid}
      helperText={helperText}
      required={!!opt.rules?.required}
    >
      {opt.options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  ),
  custom: (
    opt: ObjectField,
    field: ControllerRenderProps<FieldValues, string>,
    inValid: boolean,
    helperText?: string
  ) => opt.render?.(opt, field, inValid, helperText),
};

export function DialogConfirmForm<T>({
  body,
  action: { onAction, ...actionProps },
  title,
}: DialogConfirmFormProps<T>) {
  const { setOpen, open } = useDialog();
  const {
    control,
    formState: { isLoading, isSubmitSuccessful, isDirty },
    handleSubmit,
    reset,
  } = useForm();

  useEffect(() => {
    if (isSubmitSuccessful && open) {
      setOpen(false);
      reset();
    }
  }, [isSubmitSuccessful, open, reset, setOpen]);

  const isObjectField = (value: any): value is ObjectField =>
    value && typeof value === 'object' && 'type' in value;

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {(
            Object.entries(body) as [Extract<keyof T, string>, ObjectField | React.ReactNode][]
          ).map(([key, value]) =>
            isObjectField(value) ? (
              <Controller
                key={key}
                name={key}
                control={control}
                rules={(value as ObjectField).rules}
                defaultValue={(value as ObjectField).defaultValue as any}
                render={({ field, fieldState: { invalid, error } }) => (
                  <>
                    {mapping[(value as ObjectField).type](
                      value as ObjectField,
                      field,
                      invalid,
                      error?.message
                    )}
                  </>
                )}
              />
            ) : (
              <React.Fragment key={key}>{value as React.ReactNode}</React.Fragment>
            )
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          id="dialog-form-cancel"
          disabled={isLoading}
          color="inherit"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!isDirty}
          id="dialog-form-action"
          color="inherit"
          children={actionProps.label}
          {...actionProps}
          loading={isLoading}
          onClick={handleSubmit(async (data) => {
            await onAction(data as any);
          })}
        />
      </DialogActions>
    </>
  );
}
