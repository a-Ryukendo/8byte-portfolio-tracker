'use client';

import { useEffect, useState, useCallback } from 'react';
import { PortfolioStock } from '@/types/portfolio';
import { fetchStockData } from '@/lib/fetchStockData';
import portfolioData from '@/data/portfolio.json';

const REFRESH_INTERVAL = 15000; // 15 seconds

interface StockRow extends PortfolioStock {
  investment: number;
  presentValue: number;
  gainLoss: number;
}

/**
 * PortfolioTable component displays a table of stocks with their current values and performance
 */
export default function PortfolioTable() {
  const [portfolio, setPortfolio] = useState<StockRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateStockData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const updated = await Promise.all(
        portfolioData.map(async (stock) => {
          const symbol = stock.exchange === 'NSE' ? `${stock.stockName}.NS` : `${stock.stockName}.BO`;
          const data = await fetchStockData(symbol);
          const investment = stock.purchasePrice * stock.quantity;
          const presentValue = (data.currentPrice || 0) * stock.quantity;
          const gainLoss = presentValue - investment;

          return {
            ...stock,
            cmp: data.currentPrice,
            peRatio: data.peRatio,
            earnings: data.latestEarnings,
            investment,
            presentValue,
            gainLoss,
          };
        })
      );

      setPortfolio(updated);
    } catch (err) {
      setError('Failed to update stock data. Please try again later.');
      console.error('Error updating portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    updateStockData();
    const interval = setInterval(updateStockData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [updateStockData]);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          Updating stock data...
        </div>
      )}
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-100 text-xs uppercase">
            <th className="px-4 py-2">Stock</th>
            <th>Qty</th>
            <th>Purchase Price</th>
            <th>Investment</th>
            <th>CMP</th>
            <th>Present Value</th>
            <th>Gain/Loss</th>
            <th>P/E</th>
            <th>Earnings</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((stock) => (
            <tr key={stock.stockName} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{stock.stockName}</td>
              <td>{stock.quantity.toLocaleString()}</td>
              <td>₹{stock.purchasePrice.toLocaleString()}</td>
              <td>₹{stock.investment.toLocaleString()}</td>
              <td>₹{stock.cmp?.toLocaleString() ?? '—'}</td>
              <td>₹{stock.presentValue.toLocaleString()}</td>
              <td className={stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                ₹{stock.gainLoss.toLocaleString()}
              </td>
              <td>{stock.peRatio?.toFixed(2) ?? '—'}</td>
              <td>₹{stock.earnings?.toLocaleString() ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
