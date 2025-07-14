import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  trendLabel,
  color = 'primary',
}) {
  const theme = useTheme();
  const isPositive = trend === 'up';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette[color].lighter,
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                color: theme.palette[color].main,
                fontSize: 24,
              },
            })}
          </Box>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              {isPositive ? (
                <TrendingUp fontSize="small" />
              ) : (
                <TrendingDown fontSize="small" />
              )}
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {trendValue}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: theme.palette.text.primary,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mb: trend ? 1 : 0,
          }}
        >
          {title}
        </Typography>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: isPositive
                ? theme.palette.success.main
                : theme.palette.error.main,
            }}
          >
            {trendLabel || `${isPositive ? 'Up' : 'Down'} from last period`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard; 