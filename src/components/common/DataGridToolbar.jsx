import { Box, TextField, IconButton } from '@mui/material';
import { GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const DataGridToolbar = ({ 
  searchQuery, 
  onSearchChange, 
  onClearSearch,
  additionalButtons,
  showExport = true 
}) => {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: searchQuery && (
              <IconButton size="small" onClick={onClearSearch}>
                <ClearIcon />
              </IconButton>
            )
          }}
          sx={{ width: 300 }}
        />
        {additionalButtons}
      </Box>
      {showExport && (
        <GridToolbarExport 
          csvOptions={{
            fileName: 'export',
            delimiter: ',',
            utf8WithBom: true,
          }}
        />
      )}
    </GridToolbarContainer>
  );
};

export default DataGridToolbar; 