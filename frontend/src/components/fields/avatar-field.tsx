import type { DropzoneOptions } from 'react-dropzone';

import { useDropzone } from 'react-dropzone';
import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect, forwardRef, useCallback } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { Iconify } from '../iconify';
import { accepImg, formatSize } from './upload-field';

type AvatarFieldProps = {
  value?: File | FileItem;
  onChange: (value?: File | FileItem) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  error?: boolean;
  helperText?: string;
  opt?: Omit<DropzoneOptions, 'multiple'>;
  name?: string;
};
export const AvatarField = forwardRef<HTMLInputElement, AvatarFieldProps>((props, ref) => {
  const { opt, onChange, name, onBlur, onFocus, value, error } = props;
  const flagUserHandle = useRef<boolean>(false);
  const [preview, setPreview] = useState('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles && acceptedFiles.length ? acceptedFiles[0] : undefined;
      onChange(file);
      flagUserHandle.current = true;
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    ...opt,
    multiple: false,
    accept: opt?.accept || accepImg,
    onDrop,
  });

  useEffect(() => {
    if (value) {
      if (value instanceof File) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(value);
      } else {
        setPreview(formatFilePath(value.path));
      }
    } else {
      setPreview('');
    }
  }, [value]);

  return (
    <Stack tabIndex={0} position="relative" onBlur={onBlur} onFocus={onFocus} alignItems="center">
      <input {...getInputProps({ name })} />
      <Box
        {...getRootProps()}
        sx={{
          border: 1,
          width: 144,
          height: 144,
          borderRadius: '50%',
          borderStyle: 'dashed',
          borderColor: error ? 'error.main' : 'divider',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
        }}
      >
        {preview && (
          <Box p={1} position="absolute" width={1} height={1}>
            <Box
              component="img"
              src={preview}
              sx={{
                width: 1,
                height: 1,
                objectFit: 'cover',
                borderRadius: '50%',
                bgcolor: error ? 'error.lighter' : 'divider',
              }}
              onError={(e) => {
                e.currentTarget.setAttribute('src', formatFilePath('/$image-404.svg'));
              }}
            />
          </Box>
        )}
        <Stack
          sx={{
            borderRadius: '50%',
            height: 1,
            width: 1,
            gap: 1,
            zIndex: 2,
            alignItems: 'center',
            justifyContent: 'center',
            color: error ? 'error.dark' : 'text.disabled',
            transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { opacity: 0.8 },
            bgcolor: (t) =>
              error ? t.palette.error.light : varAlpha(t.vars.palette.grey['500Channel'], 0.08),
            ...(preview && {
              opacity: 0,
              '&:hover': {
                opacity: 1,
                color: (t) => t.palette.getContrastText(t.palette.text.primary),
                bgcolor: (t) => varAlpha(t.vars.palette.grey['900Channel'], 0.64),
              },
            }),
          }}
        >
          <Iconify width={32} icon="solar:camera-add-bold" />
          <Typography variant="caption">Upload photo</Typography>
        </Stack>
      </Box>
      <Typography
        variant="caption"
        color={error ? 'error' : 'textDisabled'}
        textAlign="center"
        mt={2}
      >
        Allowed {Object.values(opt?.accept || accepImg).flatMap((i) => `*${i}`)}
        {opt?.maxSize && (
          <>
            <br /> max size of {formatSize(opt.maxSize)}
          </>
        )}
      </Typography>
    </Stack>
  );
});
