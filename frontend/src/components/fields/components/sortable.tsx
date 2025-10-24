import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { varAlpha } from 'minimal-shared/utils';

import { Box, Tooltip, IconButton, ButtonBase } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { ImgPreview } from './Img-preview';
import { PreviewFile } from './preview-file';

type SortableImage = {
  file: File | FileItem;
  index: number;
  handleRemove: (id: number) => void;
  viewMode?: 'list' | 'grid';
};

export function SortableImage({ file, index, handleRemove, viewMode }: SortableImage) {
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
            bgcolor: 'white',
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
