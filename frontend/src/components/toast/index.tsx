import type { ExternalToast } from 'sonner';

import { toast as toaster } from 'sonner';

import { Box, Zoom, IconButton, Typography } from '@mui/material';

import { Iconify } from '../iconify';

const iconMapping = {
  success: <Iconify width={24} icon="solar:check-circle-bold" />,
  error: <Iconify width={24} icon="solar:danger-bold" />,
  warning: <Iconify width={24} icon="solar:danger-triangle-bold" />,
  info: <Iconify width={24} icon="solar:info-circle-bold" />,
  loading: (
    <Iconify
      width={24}
      sx={{
        animation: 'spin 1.5s linear infinite',
      }}
      icon="mingcute:loading-fill"
    />
  ),
};

function action(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  props?: ExternalToast & { hiddenCloseButton?: boolean }
) {
  const { hiddenCloseButton, duration = 3000, ...data } = props || {};
  const id = toaster.custom(
    () => {
      const icon = (
        <Box
          sx={{
            borderRadius: 0.75,
            height: 48,
            width: 48,
            display: 'grid',
            placeItems: 'center',
            ...(type === 'loading'
              ? {
                  bgcolor: (t) => t.vars.palette.grey[200],
                  color: (t) => t.vars.palette.grey[600],
                }
              : {
                  bgcolor: (t) => t.vars.palette.Alert[`${type}StandardBg`],
                  color: (t) => t.vars.palette.Alert[`${type}IconColor`],
                }),
          }}
        >
          {iconMapping[type]}
        </Box>
      );
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            zIndex: 10,
            borderRadius: 1,
            p: 0.5,
            gap: 1,
            boxShadow: (t) => t.vars.customShadows.z24,
            minWidth: 300,
          }}
        >
          {type !== 'loading' ? <Zoom in>{icon}</Zoom> : icon}
          <Typography
            flex={1}
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {message}
          </Typography>
          {!hiddenCloseButton && (
            <IconButton
              size="small"
              sx={{
                border: 1,
                borderColor: 'divider',
                alignSelf: 'start',
              }}
              onClick={() => toaster.dismiss(id)}
            >
              <Iconify width={12} icon="mingcute:close-line" />
            </IconButton>
          )}
        </Box>
      );
    },
    { duration, ...data }
  );

  return id;
}

async function actionLoading(
  callback: () => Promise<any>,
  mappping: {
    loading: string;
    success: string | ((p: any) => Promise<string> | string);
    error: string | ((p: any) => Promise<string> | string);
  }
) {
  const id = action(mappping.loading, 'loading', {
    hiddenCloseButton: true,
    duration: Infinity,
  });

  return callback()
    .then(async (res) => {
      const {
        success = typeof mappping.success === 'function'
          ? await mappping.success(res)
          : mappping.success,
        error,
      } = res;
      if (error) {
        action(error, 'error', {
          id,
          duration: 3000,
        });
        return;
      }
      action(success, 'success', {
        id,
        duration: 3000,
      });
    })
    .catch(async (e) => {
      const errorMessage =
        typeof mappping.error === 'function' ? await mappping.error(e) : mappping.error;
      action(errorMessage, 'error', {
        id,
        duration: 3000,
      });
    });
}

export const toast = {
  success: (message: string, data?: ExternalToast & { onClose?: () => void }) =>
    action(message, 'success', data),
  error: (
    message: string = 'Error in processing request',
    data?: ExternalToast & { onClose?: () => void }
  ) => action(message, 'error', data),
  warning: (message: string, data?: ExternalToast & { onClose?: () => void }) =>
    action(message, 'warning', data),
  info: (message: string, data?: ExternalToast & { onClose?: () => void }) =>
    action(message, 'info', data),
  loading: (
    callback: () => Promise<any>,
    mappping: {
      loading: string;
      success: string | ((p: any) => Promise<string> | string);
      error: string | ((p: any) => Promise<string> | string);
    } = {
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
    }
  ) => actionLoading(callback, mappping),
  dismiss: (id: string) => toaster.dismiss(id),
  custom: action,
};
