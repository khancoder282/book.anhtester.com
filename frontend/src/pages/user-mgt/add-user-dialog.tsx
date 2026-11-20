import { useEffect } from 'react';
import { useWatch, useFormState } from 'react-hook-form';

import { Button, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

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
  const { t } = useTranslate();
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
      <DialogTitle data-testid="user-dialog-title">
        {id ? t('user.dialog.updateTitle') : t('user.dialog.addTitle')}
      </DialogTitle>
      <DialogContent dividers>
        <ContentUser />
      </DialogContent>
      <DialogActions>
        <Button data-testid="user-dialog-cancel" color="inherit" onClick={() => setOpen(false)}>
          {t('common.actions.cancel')}
        </Button>
        <Button
          data-testid="user-dialog-save"
          loading={isLoading}
          onClick={formControl.handleSubmit((d) =>
            id ? handleUpdateUser(id, d) : handleCreateUser(d)
          )}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="solar:diskette-bold" />}
        >
          {id ? t('common.actions.update') : t('common.actions.save')}
        </Button>
      </DialogActions>
    </>
  );
}
