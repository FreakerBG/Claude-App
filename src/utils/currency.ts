// Currency formatting with a graceful fallback.
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'BGN', 'JPY', 'CAD', 'AUD', 'CHF', 'INR', 'BRL',
]
