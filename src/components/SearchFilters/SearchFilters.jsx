import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

const SearchFilters = ({
  search,
  onSearchChange,
  onSearchClear,
  filters = [],
  onFilterChange,
  sortOptions = [],
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={onSearchClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {filters.map((filter) => (
          <Grid item xs={12} md={2} key={filter.name}>
            <TextField
              select
              fullWidth
              variant="outlined"
              label={filter.label}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
            >
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        ))}

        {sortOptions.length > 0 && (
          <>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Sort By"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Order"
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value)}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default SearchFilters; 