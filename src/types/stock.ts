/**
 * Represents the market data for a stock
 */
export interface StockData {
  /** Stock symbol (e.g., 'HDFCBANK') */
  symbol: string;
  /** Current market price in INR */
  currentPrice: number;
  /** Price to Earnings ratio */
  peRatio: number;
  /** Latest earnings per share in INR */
  latestEarnings: number;
}

/**
 * Represents a stock in the portfolio with all its details
 */
export interface Stock extends StockData {
  /** Name of the stock */
  name: string;
  /** Purchase price per share in INR */
  purchasePrice: number;
  /** Number of shares held */
  quantity: number;
  /** Total investment amount (purchasePrice * quantity) */
  totalInvestment: number;
  /** Current value of holdings (currentPrice * quantity) */
  currentValue: number;
  /** Absolute gain/loss amount */
  gainLoss: number;
  /** Percentage gain/loss */
  gainLossPercentage: number;
  /** Percentage of total portfolio value */
  portfolioPercentage: number;
  /** Sector classification (e.g., 'Financial', 'Technology') */
  sector: string;
}

/**
 * Represents the overall portfolio summary
 */
export interface PortfolioSummary {
  /** Total amount invested across all stocks */
  totalInvestment: number;
  /** Current total value of all holdings */
  currentValue: number;
  /** Total absolute gain/loss */
  totalGainLoss: number;
  /** Total percentage gain/loss */
  totalGainLossPercentage: number;
  /** List of all stocks in the portfolio */
  stocks: Stock[];
} 