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

/* @deprecated use CURRENCIES instead */
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

/* @deprecated use CurrAPIClient.convert() instead */
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

/* @deprecated use CurrAPIClient.getRate() instead */
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

export const CURRENCIES = [
  'EUR',
  'USD',
  'JPY',
  'BGN',
  'CZK',
  'DKK',
  'GBP',
  'HUF',
  'PLN',
  'RON',
  'SEK',
  'CHF',
  'ISK',
  'NOK',
  'TRY',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'HKD',
  'IDR',
  'ILS',
  'INR',
  'KRW',
  'MXN',
  'MYR',
  'NZD',
  'PHP',
  'SGD',
  'THB',
  'ZAR',
  'XAU',
  'XAG',
] as const

export type Currency = (typeof CURRENCIES)[number]

export type CurrAPIClientOptions = {
  verboseMode?: boolean
  cacheGet?: (base: Currency, target: Currency, date: string) => number
  cacheSet?: (
    base: Currency,
    target: Currency,
    date: string,
    rate: number,
  ) => void
}

export class CurrAPIClient {
  private static readonly BASE_URL = 'https://currapi.com/v1' as const
  constructor(
    private apiKey: string,
    private options: CurrAPIClientOptions = {},
  ) {}

  public async convert(
    amount: number,
    base: Currency,
    target: Currency,
    date?: string,
  ): Promise<number> {
    const rate = await this.getRate(base, target, date)
    return amount * rate
  }

  public async getRate(
    base: Currency,
    target: Currency,
    date?: string,
  ): Promise<number> {
    const dateStr = date || new Date().toISOString().split('T')[0]
    return this.fetchRateCached(base, target, dateStr)
  }

  private async fetchRateCached(
    base: Currency,
    target: Currency,
    date: string,
  ): Promise<number> {
    if (this.options.cacheGet && this.options.cacheSet) {
      const cachedRate = await this.options.cacheGet(base, target, date)
      if (cachedRate) {
        if (this.options.verboseMode) {
          console.info('Using cached rate', {
            rate: cachedRate,
            base,
            target,
            date,
          })
        }
        return cachedRate
      }
    }

    const rate = await this.fetchRate(base, target, date)

    if (this.options.cacheSet && this.options.cacheGet) {
      await this.options.cacheSet(base, target, date, rate)
      if (this.options.verboseMode) {
        console.info('Fetched new rate', {
          rate,
          base,
          target,
          date,
        })
      }
    }

    return rate
  }

  private async fetchRate(
    base: Currency,
    target: Currency,
    date: string,
  ): Promise<number> {
    if (!this.apiKey) {
      throw new Error('Missing CURRAPI_API_KEY in environment variables.')
    }
    if (!CURRENCIES.includes(base)) {
      throw new Error(`Invalid base currency: ${base}`)
    }
    if (!CURRENCIES.includes(target)) {
      throw new Error(`Invalid target currency: ${target}`)
    }
    if (!date) {
      throw new Error('Date is required')
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Date must be in YYYY-MM-DD format')
    }
    if (new Date(date).toString() === 'Invalid Date') {
      throw new Error('Invalid date')
    }
    if (new Date(date) > new Date()) {
      throw new Error('Date cannot be in the future')
    }

    const url = `${CurrAPIClient.BASE_URL}/${date}/${base}/${target}/rates.json`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
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
      throw new Error(
        `Error fetching exchange rate: ${error || 'Unknown error'}`,
      )
    }

    if (this.options?.verboseMode) {
      console.info('rateLimit', rateLimit)
    }

    return data.rate
  }
}
