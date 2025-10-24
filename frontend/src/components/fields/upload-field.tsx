import type { DropzoneOptions } from 'react-dropzone';

import { useDropzone } from 'react-dropzone';
import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from '@dnd-kit/core';

import { Box, Stack, ToggleButton, FormHelperText, ToggleButtonGroup } from '@mui/material';

import { Iconify } from '../iconify';
import { UploadImg } from './upload-img';
import { SortableImage } from './components/sortable';

export const formatSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

export const getIcon = (type: string) => {
  if (type.endsWith('folder')) return '/assets/ic-folder.svg';
  if (type.includes('pdf')) return '/assets/ic-pdf.svg';
  if (type.includes('zip')) return '/assets/ic-zip.svg';
  if (type.startsWith('image')) return '/assets/ic-img.svg';
  if (type.startsWith('text')) return '/assets/ic-txt.svg';
  return '/assets/ic-file.svg';
};

export const formatType = (type: string) => type.split('/').pop()?.split(';')[0] || type;
export const defaultValueAccep = {
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],
  'image/svg+xml': ['.svg'],
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/x-tar': ['.tar'],
  'application/x-gzip': ['.gz'],
  'application/x-bzip2': ['.bz2'],
  'application/pdf': ['.pdf'],
  'application/x-pdf': ['.pdf'],
};

export const accepImg = {
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/bmp': ['.bmp'],
  'image/svg+xml': ['.svg'],
};

type UploadFieldProps = {
  name?: string;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  disabled?: boolean;
  opt?: DropzoneOptions;
  onChange?: (files: (File | FileItem)[]) => void;
  value?: (File | FileItem)[];
  delFiles?: FileItem[];
  setDelFiles?: (files: FileItem[]) => void;
  error?: boolean;
  helperText?: string;
  viewMode?: 'list' | 'grid';
  showMode?: boolean;
};

export const checkType = (
  file: File | undefined,
  type: Record<string, string[]> = defaultValueAccep
) => file && type[file.type] && type[file.type].includes('.' + file.name.split('.').pop());

export const UploadField = forwardRef<HTMLDivElement, UploadFieldProps>(
  (
    {
      opt = {
        multiple: true,
        accept: defaultValueAccep,
      },
      name,
      onChange,
      value = [],
      error = false,
      helperText,
      viewMode: dfViewMode = 'list',
      delFiles = [],
      setDelFiles,
      onBlur,
      onFocus,
      disabled,
      showMode = false,
    },
    ref
  ) => {
    const [viewMode, setMode] = useState(dfViewMode);
    const [files, setFiles] = useState<(File | FileItem)[]>(value);

    const flagUserHandle = useRef<boolean>(false);
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const onDrop = useCallback((acceptedFiles: File[]) => {
      setFiles((f) => [...f, ...acceptedFiles]);
      flagUserHandle.current = true;
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
      ...opt,
      onDrop,
    });

    useEffect(() => {
      if (JSON.stringify(files) !== JSON.stringify(value)) {
        if (flagUserHandle.current) {
          onChange?.(files);
          flagUserHandle.current = false;
        } else {
          setFiles(value);
        }
      }
    }, [files, onChange, value]);

    const handleRemove = (index: number) => {
      const f = files[index];
      if (!(f instanceof File)) setDelFiles?.([...delFiles, f]);
      setFiles(files.filter((_, i) => i !== index));
      flagUserHandle.current = true;
    };

    return (
      <Stack ref={ref} onBlur={onBlur} onFocus={onFocus} tabIndex={0} position="relative">
        <input {...getInputProps({ name })} />
        <Box
          {...getRootProps()}
          tabIndex={0}
          sx={{
            p: 3,
            border: 1,
            borderRadius: 1,
            borderColor: 'divider',
            borderStyle: 'dashed',
            cursor: 'pointer',
            bgcolor: (t) => varAlpha(t.palette.grey['500Channel'], 0.08),
            ...(error && {
              bgcolor: (t) => varAlpha(t.palette.error.mainChannel, 0.08),
              color: (t) => t.palette.error.main,
              borderColor: (t) => t.palette.error.main,
            }),
            ...(disabled && {
              opacity: 0.48,
              pointerEvents: 'none',
              cursor: 'default',
            }),
          }}
        >
          <Stack alignItems="center">
            <UploadImg sx={{ width: 200, height: 150 }} />
            <Box sx={{ fontWeight: 'bold', fontSize: 16 }}>Drop or select a files</Box>
            <Box color="text.secondary" sx={{ fontSize: 14 }}>
              Drag a file here, or{' '}
              <Box component="span" color="primary.main">
                browse
              </Box>{' '}
              your device.
            </Box>
          </Stack>
        </Box>

        {helperText && (
          <FormHelperText sx={{ mx: 1 }} error={error}>
            {helperText}
          </FormHelperText>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (active.id !== over?.id) {
              const oldIndex = files.findIndex((f) => f.name + files.indexOf(f) === active.id);
              const newIndex = files.findIndex((f) => f.name + files.indexOf(f) === over?.id);
              const reordered = arrayMove(files, oldIndex, newIndex);
              setFiles(reordered);
              flagUserHandle.current = true;
            }
          }}
        >
          <SortableContext items={files.map((f, i) => f.name + i)} strategy={rectSortingStrategy}>
            <Stack
              direction={viewMode === 'grid' ? 'row' : 'column'}
              flexWrap="wrap"
              gap={1}
              mt={1}
            >
              {files?.map((file, i) => (
                <SortableImage
                  key={file.name + i}
                  file={file}
                  index={i}
                  handleRemove={handleRemove}
                  viewMode={viewMode}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
        {showMode && (
          <ToggleButtonGroup
            size="small"
            exclusive
            sx={{
              position: 'absolute',
              left: (t) => t.spacing(1),
              top: (t) => t.spacing(1),
            }}
            value={viewMode}
            onChange={(e, v) => setMode(v)}
          >
            <ToggleButton value="grid">
              <Iconify icon="mynaui:grid" />
            </ToggleButton>
            <ToggleButton value="list">
              <Iconify icon="solar:checklist-minimalistic-linear" />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
    );
  }
);
