import type { EmblaPluginType, EmblaOptionsType } from 'embla-carousel';

import useEmblaCarousel from 'embla-carousel-react';

import { Box } from '@mui/material';

type PropType =
  | {
      slides: React.ReactNode[];
      options?: { spacing?: number; size?: number } & EmblaOptionsType;
      plugin?: EmblaPluginType[];
      children?: never;
      sx?: Sx;
      itemSx?: Sx;
    }
  | {
      slides?: never;
      options?: { spacing?: number; size?: number } & EmblaOptionsType;
      plugin?: EmblaPluginType[];
      children: React.ReactNode;
      sx?: Sx;
      itemSx?: Sx;
    };
export function CarouselDefault({
  slides,
  options = {},
  plugin = [],
  children,
  sx,
  itemSx,
}: PropType) {
  const { spacing = 0, size = 1, ...opt } = options;
  const [emblaRef] = useEmblaCarousel(opt, plugin);
  return (
    <Box ref={emblaRef} sx={{ overflow: 'hidden', ...sx }}>
      <Box
        display="flex"
        sx={{
          touchAction: 'pan-y pinch-zoom',
          ml: spacing * -1,
          height: 1,
          ...itemSx,
        }}
      >
        {slides &&
          slides.map((slide, index) => (
            <Box
              key={index}
              sx={{
                flex: `0 0 ${size <= 1 ? `${size * 100}` : `${size}`}%`,
                minWidth: 0,
                pl: spacing,
              }}
            >
              {slide}
            </Box>
          ))}
        {children}
      </Box>
    </Box>
  );
}
