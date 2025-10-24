import { useEffect } from 'react';
import { useWatch, useFormState } from 'react-hook-form';

import { Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { useDialog } from 'src/components/dialog-confirm/store';

import { formControl } from './store/form';
import { handleCreateUser } from './api/create';
import { handleUpdateUser } from './api/update';
import { ContentUser } from './components/content-user';

type AddUserDialogProps = {
  callback: () => void;
};
export function AddUserDialog({ callback }: AddUserDialogProps) {
  const { isLoading, isSubmitSuccessful } = useFormState({ control: formControl.control });
  const { setOpen } = useDialog();
  const [id] = useWatch({ control: formControl.control, name: ['id'] });

  useEffect(() => {
    if (isSubmitSuccessful) {
      setOpen(false);
      formControl.reset();
      callback();
    }
  }, [callback, isSubmitSuccessful, setOpen]);

  return (
    <>
      <DialogTitle>{id ? 'Update user' : 'Add user'}</DialogTitle>
      <DialogContent dividers>
        <ContentUser />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          loading={isLoading}
          onClick={formControl.handleSubmit((d) =>
            id ? handleUpdateUser(id, d) : handleCreateUser(d)
          )}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="solar:diskette-bold" />}
        >
          {id ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </>
  );
}
