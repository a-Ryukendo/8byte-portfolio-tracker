import { StockData } from '../types/stock';

const DEFAULT_STOCK_DATA: Partial<StockData> = {
  currentPrice: 0,
  peRatio: 0,
  latestEarnings: 0,
};

/**
 * Fetches stock data from the API
 * @param symbol - Stock symbol (e.g., 'HDFCBANK')
 * @returns Promise<Partial<StockData>> - Stock data including current price, P/E ratio, and earnings
 */
export async function fetchStockData(symbol: string): Promise<Partial<StockData>> {
  try {
    const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return { ...DEFAULT_STOCK_DATA, symbol };
  }
}
