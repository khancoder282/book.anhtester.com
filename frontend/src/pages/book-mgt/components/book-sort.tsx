import type { ButtonProps } from '@mui/material/Button';

import { useState, useCallback } from 'react';

import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 'Price: Low to High' → 'price-low-to-high' (hậu tố data-testid)
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type ProductSortProps = ButtonProps & {
  sortBy: string;
  onSort: (newSort: string) => void;
  options: { value: string; label: string }[];
};

export function BookSort({ options, sortBy, onSort, sx, ...other }: ProductSortProps) {
  const { t } = useTranslate();
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <Button
        data-testid="book-sort"
        disableRipple
        color="inherit"
        onClick={handleOpenPopover}
        endIcon={
          <Iconify
            icon={openPopover ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        }
        sx={sx}
        {...other}
      >
        {t('book.sort.label')}&nbsp;
        <Typography
          data-testid="book-sort-value"
          component="span"
          variant="subtitle2"
          sx={{ color: 'text.secondary' }}
        >
          {options.find((option) => option.value === sortBy)?.label}
        </Typography>
      </Button>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          data-testid="book-sort-menu"
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 160,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              data-testid={`book-sort-option-${slug(option.value)}`}
              selected={option.value === sortBy}
              onClick={() => {
                onSort(option.value);
                handleClosePopover();
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
