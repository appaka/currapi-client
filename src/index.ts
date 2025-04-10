import { config } from 'dotenv'

config()

const BASE_URL = 'https://currapi.com/v1' as const

export type ExchangeRateParams = {
  date: string // YYYY-MM-DD
  base: string // e.g. 'USD'
  target: string // e.g. 'EUR'
}

export type ExchangeRateResponse = {
  data?: {
    rate: number
    base: string
    target: string
    date: string
  }
  rateLimit?: {
    rateLimit: number
    remaining: number
    reset: string
  }
  success: boolean
  error?: string
}

export async function getValidCurrencies(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/currencies.json`)
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error from currapi.com: ${res.status} - ${error}`)
  }
  const { currencies } = (await res.json()) as {
    currencies: string[]
  }

  return currencies
}

export async function convertCurrency(
  amount: number,
  currency: string,
  target: string,
  date?: string,
): Promise<number> {
  const rate = await getExchangeRate({
    date: date || new Date().toISOString().split('T')[0],
    base: currency,
    target,
  })

  return amount * rate
}

export async function getExchangeRate(
  params: ExchangeRateParams,
): Promise<number> {
  const apiKey = process.env.CURRAPI_API_KEY
  if (!apiKey) {
    throw new Error('Missing CURRAPI_API_KEY in environment variables.')
  }

  const verboseMode = !!process.env.CURRAPI_VERBOSE_MODE

  const url = `${BASE_URL}/${params.date}/${params.base}/${params.target}/rates.json`
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error from currapi.com: ${res.status} - ${error}`)
  }

  const { data, rateLimit, success, error } =
    (await res.json()) as ExchangeRateResponse
  if (!success || !data) {
    throw new Error(`Error fetching exchange rate: ${error || 'Unknown error'}`)
  }

  if (verboseMode) {
    console.info('rateLimit', rateLimit)
  }

  return data.rate
}
