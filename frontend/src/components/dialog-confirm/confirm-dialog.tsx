import { useState, useEffect } from 'react';

import { Dialog } from '@mui/material';

import { useDialog } from './store';
import { confirmEvent, type ContentConfirm } from './confirm';

export function ConfigDialog() {
  const [content, setContent] = useState<ContentConfirm>();
  const { open, setOpen } = useDialog();

  useEffect(() => {
    const handle = (event: CustomEvent<ContentConfirm>) => {
      setContent(event.detail);
      setOpen(true);
    };
    confirmEvent.addEventListener('show', handle as any);
    return () => {
      confirmEvent.removeEventListener('show', handle as any);
    };
  }, [setOpen]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open}>
      {content && content.content()}
    </Dialog>
  );
}
