import type { DialogConfirmFormProps } from 'src/components/dialog-confirm/dialog-confim-form';

import { Stack, Divider, MenuItem, TextField, Autocomplete } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { dialog } from 'src/components/dialog-confirm/confirm';
import { PreviewFile } from 'src/components/fields/components/preview-file';

import { copyFile } from '../api/copy-file';
import { moveFile } from '../api/move-file';
import { deleteFile } from '../api/delete-file';
import { renameFile } from '../api/rename-file';

const NAME_PATTERN =
  /^[a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ._\-\s]+$/u;

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
type Translate = ReturnType<typeof useTranslate>['t'];

const destinationBody = (
  row: FileItem,
  allFolder: FileItem[],
  t: Translate
): DialogConfirmFormProps['body'] => {
  // A folder can never be copied/moved into itself or one of its children.
  const folders = [ROOT_FOLDER, ...allFolder].filter((f) => !isInside(f.path, row.path));
  const mapFolder = new Map(folders.map((f) => [f.path, f]));
  const options = folders.map((f) => f.path).sort((a, b) => a.localeCompare(b));

  return {
    oldPath: {
      type: 'text',
      label: t('file.destination.currentPath'),
      defaultValue: row.path,
      props: {
        disabled: true,
      },
    },
    folder: {
      type: 'custom',
      defaultValue: dirOf(row.path),
      rules: {
        required: t('file.destination.folderRequired'),
        validate: {
          exists: (v) => mapFolder.has(v) || t('file.destination.folderNotExist'),
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
                label={t('file.destination.folder')}
                placeholder={t('file.destination.folderPlaceholder')}
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
      label: t('file.destination.name'),
      defaultValue: row.name,
      rules: {
        required: t('file.destination.nameRequired'),
        pattern: {
          value: NAME_PATTERN,
          message: t('file.nameInvalid'),
        },
        validate: {
          notSame: (v, values) =>
            joinPath(values.folder, v) !== row.path || t('file.destination.pathMustDiffer'),
          notExistFolder: (v, values) =>
            !allFolder.some((f) => f.path === joinPath(values.folder, v)) ||
            t('file.destination.folderExists'),
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
}) => {
  const { t } = useTranslate();

  return (
    <Stack>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: t('file.rename.title'),
            body: {
              name: {
                type: 'text',
                label: t('file.rename.newName'),
                defaultValue: row.name,
                rules: {
                  required: t('file.rename.newNameRequired'),
                  pattern: {
                    value: NAME_PATTERN,
                    message: t('file.nameInvalid'),
                  },
                  validate: {
                    nameExist: (val) =>
                      !listFile.some((f) => f.name === val && f.path !== row.path) ||
                      t('file.rename.nameExists'),
                    noChange: (val) => val !== row.name || t('file.rename.nameMustDiffer'),
                  },
                },
                props: {
                  placeholder: row.name,
                },
              },
            },
            action: {
              children: t('common.actions.rename'),
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
        {t('common.actions.rename')}
      </MenuItem>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: t('file.destination.copyTitle'),
            body: destinationBody(row, allFolder, t),
            action: {
              children: t('file.actions.copy'),
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
        {t('file.actions.copy')}
      </MenuItem>
      <MenuItem
        onClick={() => {
          dialog.form({
            title: t('file.destination.moveTitle'),
            body: destinationBody(row, allFolder, t),
            action: {
              children: t('file.actions.move'),
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
        {t('file.actions.move')}
      </MenuItem>
      <Divider />
      <MenuItem
        sx={{ color: 'error.main' }}
        onClick={() =>
          dialog.delete(
            t(
              row.type.includes('folder') ? 'file.delete.confirmFolder' : 'file.delete.confirmFile',
              {
                name: row.name,
              }
            ),
            () => deleteFile(row.path).then(() => request())
          )
        }
      >
        <Iconify icon="solar:trash-bin-trash-bold" />
        {t('common.actions.delete')}
      </MenuItem>
    </Stack>
  );
};
