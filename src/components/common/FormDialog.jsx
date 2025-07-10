import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const FormDialog = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  maxWidth = 'md',
  fullWidth = true,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  error = null,
  hideActions = false
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          minHeight: '50vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {children}
      </DialogContent>

      {!hideActions && (
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button 
            onClick={onSubmit} 
            variant="contained" 
            disabled={loading}
            color="primary"
          >
            {loading ? 'Saving...' : submitLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FormDialog; 