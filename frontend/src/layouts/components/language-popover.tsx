import { useState } from 'react';

import { Button, Tooltip, Popover, MenuItem, MenuList } from '@mui/material';

import { LANGS, useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

/** Nút chuyển ngôn ngữ vi/en. Lựa chọn được nhớ trong localStorage (khoá `lang`). */
export function LanguagePopover() {
  const { lang, setLang, t } = useTranslate();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const current = LANGS.find((l) => l.value === lang) ?? LANGS[0];

  return (
    <>
      <Tooltip title={t('common.language')}>
        <Button
          id="btn-language"
          data-testid="language-button"
          color="inherit"
          size="small"
          aria-label={`${t('common.language')}: ${current.label}`}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
          sx={{ minWidth: 0, px: 1, fontWeight: 'fontWeightBold' }}
        >
          {current.short}
        </Button>
      </Tooltip>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList id="menu-language" data-testid="language-menu" sx={{ p: 0.5, minWidth: 160 }}>
          {LANGS.map((option) => (
            <MenuItem
              key={option.value}
              data-lang={option.value}
              data-testid={`language-option-${option.value}`}
              selected={option.value === lang}
              onClick={() => {
                setLang(option.value);
                setAnchor(null);
              }}
              sx={{ gap: 1.5, borderRadius: 0.75 }}
            >
              <b>{option.short}</b>
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
