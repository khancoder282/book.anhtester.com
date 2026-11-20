import { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';

import {
  Stack,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { UploadField } from 'src/components/fields/upload-field';
import { MAX_UPLOAD_TOTAL, totalNewFileSize } from 'src/components/fields/upload-limits';

import { uploadFile } from '../api/upload-file';
import { useDialogUpload } from '../store/use-dialog-upload';

// Cùng danh sách với backend (utils/upload-security.ts). API kiểm tra thêm nội dung tệp;
// SVG/HTML bị từ chối vì có thể chứa script.
const ALLOWED_EXT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.pdf',
  '.zip',
  '.rar',
  '.7z',
  '.gz',
  '.tgz',
  '.bz2',
  '.tar',
];
const MAX_FILES = 20;

type UploadForm = {
  path: string;
  files: File[];
};

export function DialogUpload({ reload }: { reload: () => void }) {
  const { t } = useTranslate();
  const { open, setOpen, path, rootPath } = useDialogUpload();
  const { control, handleSubmit, reset, setValue, watch } = useForm<UploadForm>();
  const [lstFiles] = watch(['files']);
  const hanldeClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const upload = handleSubmit((data) => {
    const form = new FormData();
    form.append('path', (rootPath + '/' + data.path).replace(/\/\//g, '/'));

    for (let i = 0; i < data.files.length; i++) {
      form.append('files', data.files[i]);
    }

    uploadFile(form).then(() => {
      setOpen(false);
      reset();
      reload();
    });
  });

  useEffect(() => {
    if (open) {
      reset({
        path: path.replace(rootPath, ''),
        files: [],
      });
    }
  }, [open, path, reset, rootPath]);

  return (
    <Dialog open={open} fullWidth maxWidth="sm" scroll="body">
      <DialogTitle>{t('file.upload.title')}</DialogTitle>
      <DialogContent dividers sx={{ borderTopStyle: 'dashed', borderBottomStyle: 'dashed' }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="path"
            defaultValue={path.replace(rootPath, '')}
            rules={{
              pattern: {
                value: /^[a-zA-Z0-9/_-]*$/,
                message: t('file.upload.pathInvalid'),
              },
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                label={t('file.upload.folder')}
                error={invalid}
                helperText={
                  error?.message ||
                  t('file.upload.uploadIn', {
                    path: (rootPath + '/' + field.value).replace(/\/\//g, '/'),
                  })
                }
                placeholder={t('file.upload.folderPlaceholder')}
                multiline
              />
            )}
          />
          <Controller
            control={control}
            name="files"
            rules={{
              required: t('file.upload.fileRequired'),
              validate: {
                maxFileSize: (files) =>
                  totalNewFileSize(files) <= MAX_UPLOAD_TOTAL || t('file.upload.maxFileSize'),
                // Khớp giới hạn của API POST /api/file (tối đa 20 tệp, chỉ các loại trong ALLOWED_EXT)
                maxLength: (files) => files.length <= MAX_FILES || t('file.upload.maxFiles'),
                allowedType: (files) =>
                  files.every((file) =>
                    ALLOWED_EXT.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase())
                  ) || t('file.upload.typeNotAllowed', { types: ALLOWED_EXT.join(', ') }),
              },
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <UploadField
                error={invalid}
                helperText={error?.message}
                onChange={field.onChange}
                value={field.value}
                viewMode="list"
                showMode
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {lstFiles?.length > 1 && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => setValue('files', [])}
            sx={{ mr: 'auto' }}
          >
            {t('file.upload.removeAll')}
          </Button>
        )}
        <Button onClick={hanldeClose} color="inherit">
          {t('common.actions.cancel')}
        </Button>
        <Button
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon="solar:cloud-upload-bold" />}
          onClick={upload}
        >
          {t('common.actions.upload')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
