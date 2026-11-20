import type { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme, collapsed = false) {
  return {
    '--layout-transition-easing': 'ease',
    '--layout-transition-duration': '200ms',
    // Sidebar thu gọn chỉ còn icon (88px); trạng thái lưu theo trình duyệt (store/nav-collapse.ts)
    '--layout-nav-vertical-width': collapsed ? '88px' : '300px',
    '--layout-dashboard-content-pt': theme.spacing(1),
    '--layout-dashboard-content-pb': theme.spacing(8),
    '--layout-dashboard-content-px': theme.spacing(5),
  };
}
