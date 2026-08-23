import type { DialogConfirmFormProps } from 'src/components/dialog-confirm/dialog-confim-form';

import { Stack, Divider, MenuItem, TextField, Autocomplete } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { PreviewFile } from 'src/components/fields/components/preview-file';

import { copyFile } from '../api/copy-file';
import { moveFile } from '../api/move-file';
import { deleteFile } from '../api/delete-file';
import { renameFile } from '../api/rename-file';

const NAME_PATTERN =
  /^[a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ._\-\s]+$/u;

const NAME_MESSAGE =
  'Name must not contain special characters ? / \\ : * " < > | $ # @ ! % ^ & ( ) [ ] { } + = ; , ~';

const ROOT_FOLDER: FileItem = {
  name: 'Root',
  path: '/',
  isFile: false,
  size: 0,
  type: '_/folder',
  modified: '',
  created: '',
};

/** Folder of a path: "/a/b/c.png" -> "/a/b", "/c.png" -> "/" */
const dirOf = (p: string) => {
  const parent = p.slice(0, p.lastIndexOf('/'));
  return parent === '' ? '/' : parent;
};

/** Join a folder with a name: ("/", "a.png") -> "/a.png", ("/a", "b.png") -> "/a/b.png" */
const joinPath = (folder: string, name: string) =>
  `${folder === '/' ? '' : folder}/${(name ?? '').trim()}`;

/** Is `p` inside `folder` (or the folder itself)? */
const isInside = (p: string, folder: string) => p === folder || p.startsWith(`${folder}/`);

/**
 * Destination fields shared by Copy and Move: the user picks an existing folder
 * and a file name, the final path is `folder + '/' + name`.
 */
const destinationBody = (
  row: FileItem,
  allFolder: FileItem[]
): DialogConfirmFormProps['body'] => {
  // A folder can never be copied/moved into itself or one of its children.
  const folders = [ROOT_FOLDER, ...allFolder].filter((f) => !isInside(f.path, row.path));
  const mapFolder = new Map(folders.map((f) => [f.path, f]));
  const options = folders.map((f) => f.path).sort((a, b) => a.localeCompare(b));

  return {
    oldPath: {
      type: 'text',
      label: 'Current path',
      defaultValue: row.path,
      props: {
        disabled: true,
      },
    },
    folder: {
      type: 'custom',
      defaultValue: dirOf(row.path),
      rules: {
        required: 'Destination folder is required',
        validate: {
          exists: (v) => mapFolder.has(v) || 'Destination folder does not exist',
        },
      },
      render(_, field, inValid, helperText) {
        return (
          <Autocomplete
            value={field.value ?? null}
            onChange={(_e, v) => field.onChange(v ?? '')}
            onBlur={field.onBlur}
            options={options}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                error={inValid}
                helperText={helperText}
                label="Destination folder"
                placeholder="Select a folder"
              />
            )}
            renderOption={({ key, ...props }, option) => (
              <li key={key} {...props}>
                <PreviewFile file={mapFolder.get(option) as FileItem} show={['path']} />
              </li>
            )}
          />
        );
      },
    },
    name: {
      type: 'text',
      label: 'Name',
      defaultValue: row.name,
      rules: {
        required: 'Name is required',
        pattern: {
          value: NAME_PATTERN,
          message: NAME_MESSAGE,
        },
        validate: {
          notSame: (v, values) =>
            joinPath(values.folder, v) !== row.path || 'New path must be different',
          notExistFolder: (v, values) =>
            !allFolder.some((f) => f.path === joinPath(values.folder, v)) ||
            'A folder with this name already exists',
        },
      },
      props: {
        placeholder: row.name,
      },
    },
  };
};

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
}) => (
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
                  value: NAME_PATTERN,
                  message: NAME_MESSAGE,
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
            onAction: (d) =>
              renameFile({
                path: row.path,
                name: d.name,
              }).then(() => request()),
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
          body: destinationBody(row, allFolder),
          action: {
            children: 'Copy',
            color: 'inherit',
            startIcon: <Iconify icon="solar:copy-bold-duotone" />,
            onAction: (d) =>
              copyFile({
                oldPath: row.path,
                newPath: joinPath(d.folder, d.name),
              }).then(() => request()),
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
          body: destinationBody(row, allFolder),
          action: {
            children: 'Move',
            color: 'inherit',
            startIcon: <Iconify icon="solar:move-to-folder-bold" />,
            onAction: (d) =>
              moveFile({
                oldPath: row.path,
                newPath: joinPath(d.folder, d.name),
              }).then(() => request()),
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
