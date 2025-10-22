import {
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useDialog } from './store';

export function DialogMessage({ message }: { message: string }) {
  const { setOpen } = useDialog();
  return (
    <>
      <DialogTitle>Message</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </>
  );
}
