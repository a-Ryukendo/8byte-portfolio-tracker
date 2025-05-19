const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

interface ExcelRow {
  'Particulars': string;
  'Purchase Price': number;
  'Qty': number;
  'NSE/BSE': string;
  'Investment': number;
  [key: string]: string | number | undefined;
}

// Get the root directory path (one level up from scripts)
const rootDir = path.resolve(__dirname, '..');

// Load the Excel file
const workbook = XLSX.readFile(path.join(rootDir, 'Sample Portfolio.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Step 1: Parse as 2D array
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Debug: Print the first 10 rows to inspect headers
console.log('First 10 rows of the sheet:');
console.log(JSON.stringify(rows.slice(0, 10), null, 2));

// Use the second row (index 1) as the header
const actualHeaders = rows[1].map((cell: any) => cell?.toString() || '');

// Step 2: Parse with detected header row
const rawData = XLSX.utils.sheet_to_json(sheet, {
  header: actualHeaders,
  range: 2, // skip first two rows (0 and 1)
  defval: '',
});

// Step 3: Map to normalized output
const cleanData = rawData
  .filter((row: any): row is ExcelRow => {
    const particulars = row['Particulars'];
    return Boolean(particulars) && 
           typeof particulars === 'string' && 
           particulars.toLowerCase() !== 'particulars';
  })
  .map((row: any) => ({
    stockName: row['Particulars'] || 'Unknown Stock',
    purchasePrice: Number(row['Purchase Price'] || 0),
    quantity: Number(row['Qty'] || 0),
    exchange: row['NSE/BSE'] || 'Unknown Exchange',
    sector: row['Investment'] || 'Unknown', // 'Investment' column seems to be sector
  }));

// Write to JSON file
const outputPath = path.join(rootDir, 'src', 'data', 'portfolio.json');

// Ensure the directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(cleanData, null, 2));

console.log('✅ portfolio.json generated at', outputPath);
