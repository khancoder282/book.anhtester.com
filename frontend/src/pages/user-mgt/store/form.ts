import { createFormControl } from 'react-hook-form';

export type UserForm = User & {
  password?: string;
  password_confirmation?: string;
};

export const formControl = createFormControl<UserForm>();
