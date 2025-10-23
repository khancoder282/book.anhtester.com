import { useState, forwardRef } from 'react';

import { Button, Collapse, type ButtonProps, ClickAwayListener } from '@mui/material';

import { Iconify } from '../iconify';

export const ButtonDelete = forwardRef<
  HTMLButtonElement,
  { onDelete: () => Promise<void> | void } & ButtonProps
>((props, ref) => {
  const [isCheck, setIsCheck] = useState(false);
  const [isDel, setIsDel] = useState(false);
  return (
    <ClickAwayListener onClickAway={() => isCheck && setIsCheck(false)}>
      <Button
        ref={ref}
        {...props}
        sx={{
          minWidth: 'unset',
          minHeight: 36,
          ...props.sx,
        }}
        color={isCheck ? 'error' : 'inherit'}
        onClick={async () => {
          if (isCheck) {
            try {
              setIsDel(true);
              await props.onDelete();
            } finally {
              setIsCheck(false);
              setIsDel(false);
            }
          } else setIsCheck(true);
        }}
        loading={isDel}
      >
        <Iconify icon="solar:trash-bin-trash-bold" />
        <Collapse
          in={isCheck}
          orientation="horizontal"
          unmountOnExit
          mountOnEnter
          sx={{ textWrap: 'nowrap', mx: isCheck ? 0.5 : 0 }}
        >
          {props.children || 'Click to delete'}
        </Collapse>
      </Button>
    </ClickAwayListener>
  );
});
