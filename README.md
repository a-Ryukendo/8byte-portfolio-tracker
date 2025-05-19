# 8Byte Portfolio Tracker

A real-time portfolio tracking application built with Next.js and Tremor, designed to help you monitor your stock investments with detailed sector-wise analysis and performance metrics.

## Features

- Real-time stock price updates
- Sector-wise portfolio analysis
- Detailed stock performance metrics
- Interactive portfolio performance charts
- Responsive design for all devices
- Automatic data refresh every 15 seconds

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- A modern web browser

## Setup Instructions

1. Clone the repository:
```bash
git clone <your-repository-url>
cd 8byte
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure your portfolio data:
   - Open `src/data/portfolio.json`
   - Add your stock investments following the format:
   ```json
   {
     "stockName": "Company Name",
     "exchange": "NSE/BSE Symbol",
     "purchasePrice": 1000,
     "quantity": 10,
     "sector": "Sector Name"
   }
   ```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

### Dashboard Overview
- The dashboard shows three main metrics:
  - Total Investment
  - Current Portfolio Value
  - Total Gain/Loss

### Stocks Tab
- View your portfolio grouped by sectors
- Each sector card shows:
  - Total investment in the sector
  - Current value
  - Gain/Loss
- Detailed stock information including:
  - Purchase price and quantity
  - Current market price
  - Portfolio percentage
  - P/E ratio
  - Latest earnings

### Performance Tab
- Interactive area chart showing the performance of your portfolio
- Visual representation of current value distribution across stocks

## Data Refresh
- Stock prices and metrics are automatically updated every 15 seconds
- Manual refresh is also available by reloading the page

## Deployment

The application can be deployed to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and deploy your application

## Environment Variables

No environment variables are required for basic functionality. However, if you're using a custom stock data API, you may need to configure:

```env
NEXT_PUBLIC_API_KEY=your_api_key
```


