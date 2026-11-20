import type { DropzoneOptions } from 'react-dropzone';

import { useDropzone } from 'react-dropzone';
import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect, forwardRef, useCallback } from 'react';

import { Box, Stack, Typography } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { useTranslate } from 'src/locales';

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
  /** Tiền tố data-testid (mặc định 'avatar'): <testId>-input, -dropzone, -preview */
  testId?: string;
};
export const AvatarField = forwardRef<HTMLInputElement, AvatarFieldProps>((props, ref) => {
  const { t } = useTranslate();
  const { opt, onChange, name, onBlur, onFocus, value, error, testId = 'avatar' } = props;
  const flagUserHandle = useRef<boolean>(false);
  const [preview, setPreview] = useState('');
  // Ảnh không tải được (file đã bị xoá, VD sau khi seed lại) → coi như chưa có ảnh, hiện lại ô chọn ảnh
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [preview]);
  const hasPreview = !!preview && !broken;

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
      <input {...getInputProps({ name })} data-testid={`${testId}-input`} />
      <Box
        {...getRootProps()}
        data-testid={`${testId}-dropzone`}
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
        {hasPreview && (
          <Box p={1} position="absolute" width={1} height={1}>
            <Box
              component="img"
              data-testid={`${testId}-preview`}
              src={preview}
              sx={{
                width: 1,
                height: 1,
                objectFit: 'cover',
                borderRadius: '50%',
                bgcolor: error ? 'error.lighter' : 'divider',
              }}
              // Ảnh lỗi thì ẩn đi, lộ ô chọn ảnh bên dưới. Không dùng /$image-404.svg vì file đó
              // chỉ có trong backend/upload (gitignore), máy mới clone không có.
              onError={() => setBroken(true)}
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
            bgcolor: (theme) =>
              error
                ? theme.palette.error.light
                : varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            ...(hasPreview && {
              opacity: 0,
              '&:hover': {
                opacity: 1,
                color: (theme) => theme.palette.getContrastText(theme.palette.text.primary),
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
              },
            }),
          }}
        >
          <Iconify width={32} icon="solar:camera-add-bold" />
          <Typography variant="caption">{t('components.upload.uploadPhoto')}</Typography>
        </Stack>
      </Box>
      <Typography
        variant="caption"
        color={error ? 'error' : 'textDisabled'}
        textAlign="center"
        mt={2}
      >
        {t('components.upload.allowed', {
          types: Object.values(opt?.accept || accepImg)
            .flatMap((i) => `*${i}`)
            .join(''),
        })}
        {opt?.maxSize && (
          <>
            <br /> {t('components.upload.maxSize', { size: formatSize(opt.maxSize) })}
          </>
        )}
      </Typography>
    </Stack>
  );
});
