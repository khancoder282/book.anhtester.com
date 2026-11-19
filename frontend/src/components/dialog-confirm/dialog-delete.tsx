import { useState } from 'react';

import {
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { useDialog } from './store';
import { Iconify } from '../iconify';

type DialogConfirm = {
  onDelete: () => Promise<void>;
  message: string | React.ReactNode;
};

export function DialogDelete({ onDelete, message }: DialogConfirm) {
  const { t } = useTranslate();
  const [isConfirm, setIsConfirm] = useState(false);
  const { setOpen } = useDialog();
  const handleConfirm = async () => {
    try {
      setIsConfirm(true);
      await onDelete();
    } catch {
      setIsConfirm(false);
    } finally {
      setOpen(false);
    }
  };
  return (
    <>
      <DialogTitle>{t('components.dialog.confirmDelete')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          id="dialog-delete-cancel"
          disabled={isConfirm}
          color="inherit"
          onClick={() => setOpen(false)}
        >
          {t('common.actions.cancel')}
        </Button>
        <Button
          id="dialog-delete-action"
          loading={isConfirm}
          variant="contained"
          onClick={handleConfirm}
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          {t('common.actions.delete')}
        </Button>
      </DialogActions>
    </>
  );
}
