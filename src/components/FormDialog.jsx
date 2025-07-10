import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FormDialog = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  dividers = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBackdropClick = (event) => {
    if (disableBackdropClick) {
      event.preventDefault();
      return;
    }
    onClose(event, 'backdropClick');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      onBackdropClick={handleBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: fullScreen ? '100%' : 'auto',
          maxHeight: fullScreen ? '100%' : '90vh',
        },
      }}
    >
      <DialogTitle
        id="form-dialog-title"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: (theme) =>
            dividers ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            '&:hover': {
              color: (theme) => theme.palette.grey[700],
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers={dividers}
        sx={{
          p: 3,
          '&.MuiDialogContent-dividers': {
            borderTop: (theme) =>
              dividers ? `1px solid ${theme.palette.divider}` : 'none',
            borderBottom: (theme) =>
              dividers ? `1px solid ${theme.palette.divider}` : 'none',
          },
        }}
      >
        <Box sx={{ minHeight: '100px' }}>{children}</Box>
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 2,
            borderTop: (theme) =>
              dividers ? `1px solid ${theme.palette.divider}` : 'none',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FormDialog; 