import { Stack, Divider, MenuItem, TextField, Autocomplete } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { PreviewFile } from 'src/components/fields/components/preview-file';

import { copyFile } from '../api/copy-file';
import { moveFile } from '../api/move-file';
import { deleteFile } from '../api/delete-file';
import { renameFile } from '../api/rename-file';

export const ActionFile = ({
  request,
  row,
  listFile,
  allFolder,
}: {
  row: FileItem;
  request: () => void;
  listFile: FileItem[];
  allFolder: FileItem[];
}) => {
  const mapFolder = allFolder.reduce((acc, f) => {
    acc.set(f.path, f);
    return acc;
  }, new Map<string, FileItem>());
  return (
    <Stack>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: 'Rename file or folder',
            body: {
              name: {
                type: 'text',
                label: 'New name',
                defaultValue: row.name,
                rules: {
                  required: 'New name is required',
                  pattern: {
                    value:
                      /^[a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ._\-\s]+$/u,
                    message:
                      'Name must not contain special characters ? / \\ : * " < > | $ # @ ! % ^ & ( ) [ ] { } + = ; , ~',
                  },
                  validate: {
                    nameExist: (val) =>
                      !listFile.some((f) => f.name === val && f.path !== row.path) ||
                      'Name already exists',
                    noChange: (val) => val !== row.name || 'New name must be different',
                  },
                },
                props: {
                  placeholder: row.name,
                },
              },
            },
            action: {
              children: 'Rename',
              color: 'inherit',
              startIcon: <Iconify icon="solar:text-field-focus-bold" />,
              onAction: (d) => {
                renameFile({
                  path: row.path,
                  name: d.name,
                }).then(() => request());
              },
            },
          });
        }}
      >
        <Iconify sx={{ color: 'text.secondary' }} icon="solar:text-field-focus-bold" />
        Rename
      </MenuItem>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: 'Copy file',
            body: {
              oldPath: {
                type: 'text',
                label: 'Current path',
                defaultValue: row.path,
                props: {
                  disabled: true,
                },
              },
              newPath: {
                type: 'custom',
                defaultValue: row.path,
                rules: {
                  pattern: {
                    value:
                      /^[a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ._\-\s]+$/u,
                    message:
                      'Name must not contain special characters ? / \\ : * " < > | $ # @ ! % ^ & ( ) [ ] { } + = ; , ~',
                  },
                  validate: {
                    notMove: (v) => v !== row.path || 'New path must be different.',
                  },
                },
                render(_, field, inValid, helperText) {
                  return (
                    <Autocomplete
                      freeSolo
                      value={field.value}
                      onChange={(_e, v) => field.onChange(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={inValid}
                          helperText={helperText}
                          label="New path"
                          placeholder="Enter new path"
                        />
                      )}
                      options={allFolder
                        .sort((a, b) => a.path.localeCompare(b.path))
                        .map((f) => f.path)}
                      renderOption={(props, option) => (
                        <li {...props} key={props.key}>
                          <PreviewFile file={mapFolder.get(option) as FileItem} show={['path']} />
                        </li>
                      )}
                    />
                  );
                },
              },
            },
            action: {
              children: 'Copy',
              color: 'inherit',
              startIcon: <Iconify icon="solar:copy-bold-duotone" />,
              onAction: (d) => {
                copyFile({
                  oldPath: row.path,
                  newPath: d.newPath,
                }).then(() => request());
              },
            },
          });
        }}
      >
        <Iconify sx={{ color: 'text.secondary' }} icon="solar:copy-bold-duotone" />
        Copy
      </MenuItem>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: 'Move file',
            body: {
              oldPath: {
                type: 'text',
                label: 'Current path',
                defaultValue: row.path,
                props: {
                  disabled: true,
                },
              },
              newPath: {
                type: 'custom',
                defaultValue: row.path,
                rules: {
                  pattern: {
                    value:
                      /^[a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ._\-\s]+$/u,
                    message:
                      'Name must not contain special characters ? / \\ : * " < > | $ # @ ! % ^ & ( ) [ ] { } + = ; , ~',
                  },
                  validate: {
                    notMove: (v) => v !== row.path || 'New path must be different.',
                    notStartOld: (v) =>
                      !v?.startsWith(row.path) || 'Do not move in child of folder.',
                  },
                },
                render(_, field, inValid, helperText) {
                  return (
                    <Autocomplete
                      freeSolo
                      value={field.value}
                      onChange={(_e, v) => field.onChange(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={inValid}
                          helperText={helperText}
                          label="New path"
                          placeholder="Enter new path"
                        />
                      )}
                      options={allFolder
                        .filter((f) => !f.path.startsWith(row.path))
                        .sort((a, b) => a.path.localeCompare(b.path))
                        .map((f) => f.path)}
                      renderOption={(props, option) => (
                        <li {...props} key={props.key}>
                          <PreviewFile file={mapFolder.get(option) as FileItem} show={['path']} />
                        </li>
                      )}
                    />
                  );
                },
              },
            },
            action: {
              children: 'Move',
              color: 'inherit',
              startIcon: <Iconify icon="solar:move-to-folder-bold" />,
              onAction: (d) => {
                moveFile({
                  oldPath: row.path,
                  newPath: d.newPath,
                }).then(() => request());
              },
            },
          });
        }}
      >
        <Iconify sx={{ color: 'text.secondary' }} icon="solar:move-to-folder-bold" />
        Move
      </MenuItem>
      <Divider />
      <MenuItem
        sx={{ color: 'error.main' }}
        onClick={() =>
          dialog.delete(
            `Do you want to delete ${row.type.includes('folder') ? 'folder' : 'file'}: "${row.name}" this file?`,
            () => deleteFile(row.path).then(() => request())
          )
        }
      >
        <Iconify icon="solar:trash-bin-trash-bold" />
        Delete
      </MenuItem>
    </Stack>
  );
};
