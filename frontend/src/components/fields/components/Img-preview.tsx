import { useState, useEffect, forwardRef } from 'react';

import { Box } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { getIcon } from '../upload-field';

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
        setSrc(formatFilePath(file.path));
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
