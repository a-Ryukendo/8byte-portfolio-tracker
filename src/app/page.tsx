'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanels,
  TabPanel,
  Grid,
  Metric,
  AreaChart,
} from '@tremor/react';
import { getStockData } from '../services/stockService';
import { PortfolioSummary, Stock } from '../types/stock';
import portfolioData from '../data/portfolio.json';

const REFRESH_INTERVAL = 15000; // 15 seconds

type SectorSummary = {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  gainLoss: number;
  stocks: Stock[];
};

function groupBySector(stocks: Stock[]): SectorSummary[] {
  const sectorMap = new Map<string, Stock[]>();
  
  stocks.forEach(stock => {
    const sector = stock.sector;
    const sectorStocks = sectorMap.get(sector) || [];
    sectorMap.set(sector, [...sectorStocks, stock]);
  });

  return Array.from(sectorMap.entries()).map(([sector, stocks]) => {
    const totalInvestment = stocks.reduce((sum, s) => sum + s.totalInvestment, 0);
    const totalPresentValue = stocks.reduce((sum, s) => sum + s.currentValue, 0);
    const gainLoss = totalPresentValue - totalInvestment;
    return { sector, totalInvestment, totalPresentValue, gainLoss, stocks };
  });
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    totalInvestment: 0,
    currentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercentage: 0,
    stocks: [],
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchStockDataAndUpdate() {
    const stocks = await Promise.all(
      portfolioData.map(async (stock) => {
        const exchangeSymbol = typeof stock.exchange === 'number' ? stock.exchange.toString() : stock.exchange;
        const marketData = await getStockData(exchangeSymbol);
        const currentPrice = marketData.currentPrice || 0;
        const currentValue = currentPrice * stock.quantity;
        const totalInvestment = stock.purchasePrice * stock.quantity;
        const gainLoss = currentValue - totalInvestment;
        const gainLossPercentage = (gainLoss / totalInvestment) * 100;

        return {
          symbol: exchangeSymbol,
          name: stock.stockName,
          currentPrice,
          peRatio: marketData.peRatio || 0,
          latestEarnings: marketData.latestEarnings || 0,
          purchasePrice: stock.purchasePrice,
          quantity: stock.quantity,
          totalInvestment,
          currentValue,
          gainLoss,
          gainLossPercentage,
          portfolioPercentage: 0,
          sector: typeof stock.sector === 'number' ? stock.sector.toString() : stock.sector || 'Unknown',
        } satisfies Stock;
      })
    );

    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.totalInvestment, 0);
    const currentValue = stocks.reduce((sum, stock) => sum + stock.currentValue, 0);
    const totalGainLoss = currentValue - totalInvestment;
    const totalGainLossPercentage = (totalGainLoss / totalInvestment) * 100;

    // Calculate portfolio percentage for each stock
    const stocksWithPortfolioPercentage = stocks.map(stock => ({
      ...stock,
      portfolioPercentage: (stock.totalInvestment / totalInvestment) * 100
    }));

    setPortfolio({
      totalInvestment,
      currentValue,
      totalGainLoss,
      totalGainLossPercentage,
      stocks: stocksWithPortfolioPercentage,
    });
  }

  useEffect(() => {
    fetchStockDataAndUpdate();
    intervalRef.current = setInterval(fetchStockDataAndUpdate, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Group stocks by sector for the Stocks tab
  const sectorSummaries = groupBySector(portfolio.stocks);

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title className="text-2xl md:text-3xl">Portfolio Dashboard</Title>
      <Text className="text-sm md:text-base">Track your investments in real-time</Text>

      <TabGroup className="mt-6">
        <TabList className="flex flex-wrap gap-2">
          <Tab>Overview</Tab>
          <Tab>Stocks</Tab>
          <Tab>Performance</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 md:gap-6 mt-6">
              <Card className="p-4 md:p-6">
                <Text className="text-sm md:text-base">Total Investment</Text>
                <Metric className="text-lg md:text-xl">₹{portfolio.totalInvestment.toLocaleString()}</Metric>
              </Card>
              <Card className="p-4 md:p-6">
                <Text className="text-sm md:text-base">Current Value</Text>
                <Metric className="text-lg md:text-xl">₹{portfolio.currentValue.toLocaleString()}</Metric>
              </Card>
              <Card className="p-4 md:p-6">
                <Text className="text-sm md:text-base">Total Gain/Loss</Text>
                <Metric className={`text-lg md:text-xl ${portfolio.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{portfolio.totalGainLoss.toLocaleString()} ({portfolio.totalGainLossPercentage.toFixed(2)}%)
                </Metric>
              </Card>
            </Grid>
          </TabPanel>
          <TabPanel>
            <div className="flex flex-col gap-6 md:gap-8 mt-6">
              {sectorSummaries.map(sector => (
                <Card key={sector.sector} className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 p-4">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                      <Title className="text-lg md:text-xl">{sector.sector}</Title>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                      <div>
                        <Text className="text-sm md:text-base">Total Investment</Text>
                        <Metric className="text-base md:text-lg">₹{sector.totalInvestment.toLocaleString()}</Metric>
                      </div>
                      <div>
                        <Text className="text-sm md:text-base">Total Present Value</Text>
                        <Metric className="text-base md:text-lg">₹{sector.totalPresentValue.toLocaleString()}</Metric>
                      </div>
                      <div>
                        <Text className="text-sm md:text-base">Gain/Loss</Text>
                        <Metric className={`text-base md:text-lg ${sector.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ₹{sector.gainLoss.toLocaleString()}
                        </Metric>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio %</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NSE/BSE</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CMP</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Present Value</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P/E Ratio</th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Earnings</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sector.stocks.map((stock) => (
                              <tr key={stock.symbol} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stock.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">₹{stock.purchasePrice.toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{stock.quantity.toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">₹{stock.totalInvestment.toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{stock.portfolioPercentage.toFixed(2)}%</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{stock.symbol}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">₹{stock.currentPrice.toLocaleString()}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">₹{stock.currentValue.toLocaleString()}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${stock.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  ₹{stock.gainLoss.toLocaleString()} ({stock.gainLossPercentage.toFixed(2)}%)
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">{stock.peRatio.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">₹{stock.latestEarnings.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabPanel>
          <TabPanel>
            <Card className="mt-6 p-4 md:p-6">
              <Title className="text-lg md:text-xl">Portfolio Performance</Title>
              <div className="mt-4 h-[300px] md:h-[400px]">
                <AreaChart
                  data={portfolio.stocks.map(stock => ({
                    name: stock.name,
                    value: stock.currentValue,
                  }))}
                  index="name"
                  categories={["value"]}
                  colors={["blue"]}
                  valueFormatter={(number) => `₹${number.toLocaleString()}`}
                  showLegend={true}
                  showGridLines={true}
                  showAnimation={true}
                />
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
