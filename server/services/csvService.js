import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';

export const exportToCSV = (data, fields, filename) => {
  try {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Configure CSV parser
    const parser = new Parser({
      fields: fields.map(field => ({
        label: field.replace('.', ' ').replace(/([A-Z])/g, ' $1').trim(),
        value: field
      })),
      flatten: true
    });

    // Parse data to CSV
    const csv = parser.parse(data);

    // Write to file
    const filePath = path.join(tempDir, `${filename}-${Date.now()}.csv`);
    fs.writeFileSync(filePath, csv);

    return filePath;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

export const formatDateForCSV = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatCurrencyForCSV = (amount) => {
  if (!amount) return '0.00';
  return parseFloat(amount).toFixed(2);
}; 