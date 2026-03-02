// app/api/pricing-details/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getRegionalPricing } from '@/lib/pricingPlans';
// import getSymbolFromCurrency from 'currency-symbol-map'
// import countryToCurrency from 'country-to-currency';
import { getIPDetails } from '@/lib/fetchUtil';

export async function GET() {
  try {
    const res = await getIPDetails();
    const ipDetails = await res.json()
    const country = ipDetails.country_code
    const currency = ipDetails.currency_code
    const symbol = ipDetails.currency_symbol
    if(!res.ok){
      console.error(ipDetails.detail)
    }
    const response = await getRegionalPricing(country,currency)
    const all_plans = await response.json()

    const updatedPlans = all_plans.map(plan => ({
      ...plan,
      country_code:country,
      currency: currency,
      symbol: symbol
    }));

    return NextResponse.json(updatedPlans, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Location detection failed:', error);
    return NextResponse.json(
      { country_code: 'US', error: 'Location detection failed' },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
