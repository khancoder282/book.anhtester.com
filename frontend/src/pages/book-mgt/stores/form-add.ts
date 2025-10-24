import { createFormControl } from 'react-hook-form';

export const { control, getValues, setValue, formControl, handleSubmit, setError, reset, setFocus } =
  createFormControl<BookForm>();
