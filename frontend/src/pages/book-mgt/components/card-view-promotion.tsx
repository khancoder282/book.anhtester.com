import { Card, CardContent } from '@mui/material';

export function CardViewPromotion({ sx }: CardViewPromotionProps) {
  return (
    <Card sx={sx}>
      <CardContent />
    </Card>
  );
}

type CardViewPromotionProps = {
  sx?: Sx;
};
