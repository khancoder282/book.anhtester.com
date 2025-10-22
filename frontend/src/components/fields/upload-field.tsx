import type { DropzoneOptions } from 'react-dropzone';

import { CSS } from '@dnd-kit/utilities';
import { useDropzone } from 'react-dropzone';
import { varAlpha } from 'minimal-shared/utils';
import { useRef, useState, useEffect, forwardRef, useCallback } from 'react';
import { arrayMove, useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from '@dnd-kit/core';

import {
  Box,
  Stack,
  Tooltip,
  Typography,
  ButtonBase,
  IconButton,
  FormHelperText,
} from '@mui/material';

import { formatfilePath } from 'src/utils/format-filepath';

import { Iconify } from '../iconify';
import { UploadImg } from './upload-img';

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

export function UploadField({
  opt = {
    multiple: true,
    accept: {
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
    },
  },
  onChange,
  value = [],
  error = false,
  helperText,
  viewMode = 'list',
}: {
  opt?: DropzoneOptions;
  onChange?: (files: (File | FileItem)[]) => void;
  value?: (File | FileItem)[];
  error?: boolean;
  helperText?: string;
  viewMode?: 'list' | 'grid';
}) {
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
    setFiles(files.filter((_, i) => i !== index));
    flagUserHandle.current = true;
  };

  return (
    <Stack>
      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          border: 1,
          borderRadius: 1,
          borderColor: 'divider',
          borderStyle: 'dashed',
          bgcolor: (t) => varAlpha(t.palette.grey['500Channel'], 0.08),
          ...(error && {
            bgcolor: (t) => varAlpha(t.palette.error.mainChannel, 0.08),
            color: (t) => t.palette.error.main,
            borderColor: (t) => t.palette.error.main,
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
        <input {...getInputProps()} />
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
          <Stack direction={viewMode === 'grid' ? 'row' : 'column'} flexWrap="wrap" gap={1} mt={1}>
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
    </Stack>
  );
}

export function PreviewFile({
  file,
  isPreview = false,
  sx,
  show = ['size', 'type'],
}: {
  file: File | FileItem;
  isPreview?: boolean;
  sx?: Sx;
  show?: ('path' | 'size' | 'type')[];
}) {
  return (
    <Box
      sx={{
        gap: 1.5,
        p: 1,
        pl: 1.5,
        border: 1,
        borderRadius: 1,
        borderColor: 'divider',
        alignItems: 'center',
        display: 'flex',
        width: 1,
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <ImgPreview file={file} isPreview={isPreview} />
      <Stack flex={1} overflow="hidden">
        <Typography flex={1} variant="body1" width={1} noWrap overflow="hidden">
          {file.name}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {show.map((f) => showInfo[f](file)).join(' - ')}
        </Typography>
      </Stack>
    </Box>
  );
}

const showInfo = {
  path: (f: FileItem | File) => (f instanceof File ? f.name : f.path),
  size: (f: FileItem | File) => formatSize(f.size),
  type: (f: FileItem | File) => formatType(f.type),
};

export const ImgPreview = forwardRef<
  HTMLImageElement,
  {
    file: File | FileItem;
    isPreview?: boolean;
    sx?: Sx;
  }
>(({ file, isPreview = false, sx }, ref) => {
  const [src, setSrc] = useState(getIcon(file.type));

  useEffect(() => {
    if (file.type.startsWith('image') && isPreview) {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = () => setSrc(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setSrc(formatfilePath(file.path));
      }
    } else {
      setSrc(getIcon(file.type));
    }
  }, [file, isPreview]);

  return (
    <Box
      ref={ref}
      component="img"
      loading="lazy"
      src={src}
      sx={{
        width: 36,
        height: 36,
        objectFit: 'cover',
        borderRadius: 0.5,
        ...sx,
      }}
    />
  );
});

type SortableImage = {
  file: File | FileItem;
  index: number;
  handleRemove: (id: number) => void;
  viewMode?: 'list' | 'grid';
};

function SortableImage({ file, index, handleRemove, viewMode }: SortableImage) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.name + index,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    position: 'relative',
  };

  if (viewMode === 'list')
    return (
      <Box style={style} ref={setNodeRef}>
        <Box {...listeners} {...attributes}>
          <PreviewFile file={file} isPreview sx={{ pr: 7 }} />
        </Box>
        <IconButton
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            position: 'absolute',
            top: (t) => t.spacing(0.75),
            right: (t) => t.spacing(0.75),
          }}
          onClick={() => handleRemove(index)}
        >
          <Iconify width={16} icon="mingcute:close-line" />
        </IconButton>
      </Box>
    );

  return (
    <Tooltip
      title={file.name}
      arrow
      slotProps={{
        popper: {
          disablePortal: true,
          style: {
            transition: 'opacity 0.2s ease-in-out',
            opacity: isDragging ? 0 : 1,
          },
        },
      }}
    >
      <Box ref={setNodeRef} style={style}>
        <Box {...listeners} {...attributes}>
          <ImgPreview
            sx={{
              width: 78,
              height: 78,
              objectFit: 'contain',
              border: 1,
              borderColor: 'divider',
            }}
            isPreview
            file={file}
          />
        </Box>
        <ButtonBase
          sx={{
            position: 'absolute',
            top: (t) => t.spacing(0.25),
            right: (t) => t.spacing(0.25),
            borderRadius: '50%',
          }}
          onClick={() => handleRemove(index)}
        >
          <Iconify
            icon="solar:close-circle-bold"
            width={24}
            sx={{
              color: (t) => varAlpha(t.palette.grey['900Channel'], 0.48),
            }}
          />
        </ButtonBase>
      </Box>
    </Tooltip>
  );
}
