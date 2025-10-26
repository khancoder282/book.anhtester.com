import type { LabelColor } from 'src/components/label';
import type { IconifyName } from 'src/components/iconify';

export const MappingType: Record<
  PromotionType['type'],
  {
    icon: IconifyName;
    color: LabelColor;
  }
> = {
  PERCENTAGE: {
    icon: 'ph:seal-percent-fill',
    color: 'warning',
  },
  FIXED_AMOUNT: {
    icon: 'solar:money-bag-bold',
    color: 'success',
  },
  FREE_SHIPPING: {
    icon: 'streamline-ultimate:shipping-logistic-free-shipping-delivery-truck-bold',
    color: 'error',
  },
};
