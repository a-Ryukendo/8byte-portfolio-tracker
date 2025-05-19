export interface PortfolioStock {
  stockName: string;
  purchasePrice: number;
  quantity: number;
  exchange: 'NSE' | 'BSE';
  sector: string;
  cmp?: number;
  peRatio?: number;
  earnings?: string;
}
export interface ExcelRow {
  'Particulars'?: string;
  'Purchase Price'?: number | string;
  'Qty'?: number | string;
  'NSE/BSE'?: string;
  'Sector'?: string;
}
