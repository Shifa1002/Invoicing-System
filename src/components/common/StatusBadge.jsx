import React from 'react';
import { Chip, useTheme } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

const statusConfig = {
  active: {
    icon: <CheckCircleIcon />,
    color: 'success',
  },
  inactive: {
    icon: <ErrorIcon />,
    color: 'error',
  },
  pending: {
    icon: <PendingIcon />,
    color: 'warning',
  },
  draft: {
    icon: <InfoIcon />,
    color: 'info',
  },
  overdue: {
    icon: <WarningIcon />,
    color: 'error',
  },
  paid: {
    icon: <CheckCircleIcon />,
    color: 'success',
  },
  unpaid: {
    icon: <ErrorIcon />,
    color: 'error',
  },
  partial: {
    icon: <PendingIcon />,
    color: 'warning',
  },
};

function StatusBadge({ status, label, size = 'medium', variant = 'filled' }) {
  const theme = useTheme();
  const config = statusConfig[status.toLowerCase()] || {
    icon: <InfoIcon />,
    color: 'default',
  };

  return (
    <Chip
      icon={config.icon}
      label={label || status}
      color={config.color}
      size={size}
      variant={variant}
      sx={{
        '& .MuiChip-icon': {
          color: 'inherit',
        },
        ...(variant === 'outlined' && {
          borderColor: theme.palette[config.color].main,
          '&:hover': {
            backgroundColor: theme.palette[config.color].lighter,
          },
        }),
      }}
    />
  );
}

export default StatusBadge; 