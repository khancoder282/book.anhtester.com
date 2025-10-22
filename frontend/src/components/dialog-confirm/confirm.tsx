import { DialogDelete } from './dialog-delete';
import { DialogConfirm } from './dialog-confim';
import { DialogMessage } from './dialog-message';
import { DialogConfirmForm, type DialogConfirmFormProps } from './dialog-confim-form';

export const confirmEvent = new EventTarget();

export type ContentConfirm = {
  content: () => React.ReactNode;
};

export const dialog = {
  message: (msg: string) => {
    confirmEvent.dispatchEvent(
      new CustomEvent<ContentConfirm>('show', {
        detail: {
          content: () => <DialogMessage message={msg} />,
        },
      })
    );
  },
  confirm: (confirm: string, onConfirm: () => Promise<void>) => {
    confirmEvent.dispatchEvent(
      new CustomEvent<ContentConfirm>('show', {
        detail: {
          content: () => <DialogConfirm onConfirm={onConfirm} message={confirm} />,
        },
      })
    );
  },
  form: (props: DialogConfirmFormProps<any>) => {
    confirmEvent.dispatchEvent(
      new CustomEvent<ContentConfirm>('show', {
        detail: {
          content: () => <DialogConfirmForm {...props} />,
        },
      })
    );
  },
  delete: (message: string, onDelete: () => Promise<void>) => {
    confirmEvent.dispatchEvent(
      new CustomEvent<ContentConfirm>('show', {
        detail: {
          content: () => <DialogDelete onDelete={onDelete} message={message} />,
        },
      })
    );
  },
  custom: (content: () => React.ReactNode) => {
    confirmEvent.dispatchEvent(
      new CustomEvent<ContentConfirm>('show', {
        detail: {
          content,
        },
      })
    );
  },
};
