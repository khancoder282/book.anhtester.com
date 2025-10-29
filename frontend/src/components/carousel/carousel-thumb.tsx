import type { EmblaPluginType, EmblaOptionsType } from 'embla-carousel';

import { varAlpha } from 'minimal-shared/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

import { Box, Stack, Button } from '@mui/material';

import { formatFilePath } from 'src/utils/format-filepath';

import { Iconify } from '../iconify';

type CarouselThumbProps = {
  options?: EmblaOptionsType;
  plugin?: EmblaPluginType[];
  listSrc: string[];
  sx?: Sx;
  itemSx?: Sx;
};
export function CarouselThumb({
  options = {},
  plugin = [],
  sx,
  itemSx,
  listSrc,
}: CarouselThumbProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options, plugin);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();

    emblaMainApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <Stack spacing={2} px={{ xs: 0, md: 4 }}>
      <Box
        ref={emblaMainRef}
        sx={{ overflow: 'hidden', borderRadius: 2, position: 'relative', ...sx }}
      >
        <Box
          display="flex"
          sx={{
            touchAction: 'pan-y pinch-zoom',
            ml: -2,
            height: 1,
            ...itemSx,
          }}
        >
          {listSrc.map((slide, index) => (
            <Box
              key={index}
              sx={{
                flex: `0 0 100%`,
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src={formatFilePath(slide)}
                sx={{
                  width: 1,
                  aspectRatio: '1 /  1',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Box>
        <Box
          bgcolor={(t) => varAlpha(t.palette.grey['900Channel'], 0.48)}
          sx={{
            position: 'absolute',
            bottom: (t) => t.spacing(2),
            right: (t) => t.spacing(2),
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            gap: 1,
            borderRadius: 1,
            '& > button': {
              borderRadius: 0.75,
              color: '#fff',
              minWidth: 'unset',
            },
          }}
        >
          <Button
            size="small"
            disabled={selectedIndex === 0}
            onClick={() => {
              setSelectedIndex((t) => t - 1);
              emblaMainApi?.scrollPrev();
              emblaThumbsApi?.scrollPrev();
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" sx={{ scale: -1 }} />
          </Button>
          <Box sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.57143, color: '#fff' }}>
            {selectedIndex + 1}/{listSrc.length}
          </Box>
          <Button
            size="small"
            disabled={selectedIndex === listSrc.length - 1}
            onClick={() => {
              setSelectedIndex((t) => t + 1);
              emblaMainApi?.scrollNext();
              emblaThumbsApi?.scrollNext();
            }}
          >
            <Iconify icon="eva:arrow-ios-forward-fill" />
          </Button>
        </Box>
      </Box>
      <Box>
        <Box width={360} mx="auto" overflow="hidden" ref={emblaThumbsRef}>
          <Box mr={2} display="flex" width={1}>
            {listSrc.map((src, index) => (
              <Box
                key={src}
                component="img"
                src={formatFilePath(src)}
                onClick={() => onThumbClick(index)}
                sx={{
                  flex: `0 0 auto`,
                  width: 64,
                  height: 64,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  mr: 1,
                  opacity: 0.48,
                  transition: 'all 0.2s ease-in-out',
                  border: '3px solid',
                  borderColor: 'transparent',
                  ...(selectedIndex === index && {
                    borderColor: 'primary.main',
                    opacity: 1,
                  }),
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

type PropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
};

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, index, onClick } = props;

  return (
    <div className={'embla-thumbs__slide'.concat(selected ? ' embla-thumbs__slide--selected' : '')}>
      <button onClick={onClick} type="button" className="embla-thumbs__slide__number">
        {index + 1}
      </button>
    </div>
  );
};
