import { Stack, MenuItem } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';

import { deletePromotion } from '../api/delete-promotion';

export function ActionList({ row, request }: { row: PromotionType; request: () => Promise<void> }) {
  return (
    <Stack>
      <MenuItem onClick={() => {}}>
        <Iconify icon="solar:pen-bold" />
        Edit
      </MenuItem>

      <MenuItem
        sx={{ color: 'error.main' }}
        onClick={() =>
          dialog.delete(`Confirm you want to delete user "${row.name}".`, async () => {
            await deletePromotion(row.id);
            await request();
          })
        }
      >
        <Iconify icon="solar:trash-bin-trash-bold" />
        Delete
      </MenuItem>
    </Stack>
  );
}
