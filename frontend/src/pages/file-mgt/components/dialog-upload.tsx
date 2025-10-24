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

import { Iconify } from 'src/components/iconify';
import { UploadField } from 'src/components/fields/upload-field';

import { uploadFile } from '../api/upload-file';
import { useDialogUpload } from '../store/use-dialog-upload';

type UploadForm = {
  path: string;
  files: File[];
};

export function DialogUpload({ reload }: { reload: () => void }) {
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
      <DialogTitle>Upload file</DialogTitle>
      <DialogContent dividers sx={{ borderTopStyle: 'dashed', borderBottomStyle: 'dashed' }}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="path"
            defaultValue={path.replace(rootPath, '')}
            rules={{
              pattern: {
                value: /^[a-zA-Z0-9/_-]*$/,
                message:
                  'Path can only contain characters a-z, A-Z, 0-9, _, -, and /, not starting with /',
              },
            }}
            render={({ field, fieldState: { error, invalid } }) => (
              <TextField
                {...field}
                label="Folder upload file"
                error={invalid}
                helperText={
                  error?.message ||
                  `Upload in: ${(rootPath + '/' + field.value).replace(/\/\//g, '/')}`
                }
                placeholder="Enter a folder name or use the current folder"
                multiline
              />
            )}
          />
          <Controller
            control={control}
            name="files"
            rules={{
              required: 'File is required',
              validate: {
                maxFileSize: (files) =>
                  files.every((file) => file.size < 1024 * 1024 * 5) ||
                  'File size must be less than 5MB',
                maxLength: (files) => files.length <= 30 || 'You can upload up to 30 files',
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
            Remove all
          </Button>
        )}
        <Button onClick={hanldeClose} color="inherit">
          Cancel
        </Button>
        <Button
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon="solar:cloud-upload-bold" />}
          onClick={upload}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
