import { useState } from 'react';

import {
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useDialog } from './store';
import { Iconify } from '../iconify';

type DialogConfirm = {
  onDelete: () => Promise<void>;
  message: string | React.ReactNode;
};

export function DialogDelete({ onDelete, message }: DialogConfirm) {
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
      <DialogTitle>Confirm delete</DialogTitle>
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
          Cancel
        </Button>
        <Button
          id="dialog-delete-action"
          loading={isConfirm}
          variant="contained"
          onClick={handleConfirm}
          color="error"
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Delete
        </Button>
      </DialogActions>
    </>
  );
}
