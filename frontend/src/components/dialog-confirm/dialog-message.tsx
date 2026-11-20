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
      <DialogTitle data-testid="message-dialog-title">{t('components.dialog.message')}</DialogTitle>
      <DialogContent>
        <DialogContentText data-testid="message-dialog-message">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button data-testid="message-dialog-close" color="inherit" onClick={() => setOpen(false)}>
          {t('common.actions.close')}
        </Button>
      </DialogActions>
    </>
  );
}
