import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function PageHeader({
  title,
  subtitle,
  action,
  actionIcon = <AddIcon />,
  actionText,
  onAction,
  children,
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {children}
        {action && (
          <Button
            variant="contained"
            startIcon={actionIcon}
            onClick={onAction}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default PageHeader; 