import { Parser } from 'json2csv';
import fs from 'fs';
import path from 'path';

export const exportToCSV = (data, fields, fileNamePrefix = 'export') => {
  const parser = new Parser({ fields });
  const csv = parser.parse(data);
  const fileName = `${fileNamePrefix}-${Date.now()}.csv`;
  const filePath = path.join(process.cwd(), 'server', 'temp', fileName);
  fs.writeFileSync(filePath, csv);
  return filePath;
}; 