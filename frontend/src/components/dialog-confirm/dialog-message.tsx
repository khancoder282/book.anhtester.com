import {
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { useDialog } from './store';

export function DialogMessage({ message }: { message: string }) {
  const { t } = useTranslate();
  const { setOpen } = useDialog();
  return (
    <>
      <DialogTitle>{t('components.dialog.message')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setOpen(false)}>
          {t('common.actions.close')}
        </Button>
      </DialogActions>
    </>
  );
}
