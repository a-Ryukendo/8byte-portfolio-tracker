import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol missing' }, { status: 400 });
  }

  try {
    const data = await yahooFinance.quote(symbol);
    return NextResponse.json({
      cmp: data.regularMarketPrice,
      peRatio: data.trailingPE,
      earnings: data.epsTrailingTwelveMonths,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
