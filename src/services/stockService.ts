import axios from 'axios';
import yahooFinance from 'yahoo-finance2';
import { StockData } from '../types/stock';
import * as cheerio from 'cheerio';

const REFRESH_INTERVAL = 15000; // 15 seconds
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
const NSE_SUFFIX = '.NS';

/**
 * Fetches stock data from Yahoo Finance and Google Finance
 * @param symbol - Stock symbol (e.g., 'HDFCBANK')
 * @returns Promise<Partial<StockData>> - Stock data including current price, P/E ratio, and earnings
 */
export async function getStockData(symbol: string): Promise<Partial<StockData>> {
  try {
    // Fetch from Yahoo Finance using yahoo-finance2 package
    const quote = await yahooFinance.quote(symbol + NSE_SUFFIX);
    const currentPrice = quote.regularMarketPrice;

    // Fetch from Google Finance with improved scraping
    const googleResponse = await axios.get(`https://www.google.com/finance/quote/${symbol}:NSE`, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT }
    });
    
    const $ = cheerio.load(googleResponse.data);
    const peRatio = extractPE($);
    const latestEarnings = extractEarnings($);

    return {
      symbol,
      currentPrice,
      peRatio,
      latestEarnings,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return {
      symbol,
      currentPrice: 0,
      peRatio: 0,
      latestEarnings: 0,
    };
  }
}

/**
 * Extracts P/E ratio from Google Finance HTML
 * @param $ - Cheerio instance loaded with Google Finance HTML
 * @returns number - P/E ratio or 0 if not found
 */
function extractPE($: cheerio.CheerioAPI): number {
  try {
    const peElement = $('div[data-test="key-stats"]')
      .find('div:contains("P/E Ratio")')
      .next();
    const peText = peElement.text().trim();
    return parseFloat(peText) || 0;
  } catch (error) {
    console.error('Error extracting P/E ratio:', error);
    return 0;
  }
}

/**
 * Extracts latest earnings from Google Finance HTML
 * @param $ - Cheerio instance loaded with Google Finance HTML
 * @returns number - Latest earnings or 0 if not found
 */
function extractEarnings($: cheerio.CheerioAPI): number {
  try {
    const earningsElement = $('div[data-test="financials"]')
      .find('div:contains("Earnings")')
      .next();
    const earningsText = earningsElement.text().trim();
    return parseFloat(earningsText.replace(/[₹,]/g, '')) || 0;
  } catch (error) {
    console.error('Error extracting earnings:', error);
    return 0;
  }
} 