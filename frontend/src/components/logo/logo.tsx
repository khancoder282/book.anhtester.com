import { Link } from 'react-router-dom';

import { Box, type BoxProps } from '@mui/material';

type LogoProps = BoxProps;
export function Logo(props: LogoProps) {
  return (
    <Link to="/" viewTransition style={{ textAlign: 'center' }}>
      <Box
        component="img"
        loading="lazy"
        height={50}
        src="/assets/anhtester_logo_512.png"
        sx={{
          objectFit: 'contain',
        }}
        {...props}
      />
    </Link>
  );
}
