# @appaka/currapi

> Official Node.js client for [currapi.com](https://currapi.com) — a simple API for historical currency exchange rates.

## 📦 Install

```bash
npm install @appaka/currapi
```

or with Yarn:

```bash
yarn add @appaka/currapi
```

---

## 🚀 Usage

This client provides a modern and extensible way to interact with [currapi.com](https://currapi.com), including automatic caching and validation.

### 🔐 Set your API key

We recommend using environment variables to store your API key:

```env
CURRAPI_API_KEY=your_api_key_here
```

[Get your API key](https://currapi.com/pricing).

---

## `CurrAPIClient` class

```ts
import { CurrAPIClient } from '@appaka/currapi'

const client = new CurrAPIClient(process.env.CURRAPI_API_KEY!)

const rate = await client.getRate('USD', 'EUR', '2024-03-15')

const amount = await client.convert(100, 'USD', 'EUR', '2024-03-15')
```

### 🧰 With optional cache support

```ts
import Redis from 'ioredis'
import { CurrAPIClient } from '@appaka/currapi'

const redis = new Redis(process.env.REDIS_URL!)

const client = new CurrAPIClient(process.env.CURRAPI_API_KEY!, {
  verboseMode: true,
  cacheGet: (base, target, date) => redis.get(`${date}:${base}${target}`),
  cacheSet: (base, target, date, rate) =>
    redis.set(`${date}:${base}${target}`, rate),
})
```

---

## 🔁 API Reference

### `getRate(base, target, date?)`

Fetches the exchange rate for a given date. Defaults to today if not provided.

### `convert(amount, base, target, date?)`

Converts an amount from one currency to another using the rate for a given date.

---

## 💱 Supported Currencies

You can access the full list via:

```ts
import { CURRENCIES } from '@appaka/currapi'

console.log(CURRENCIES)
// ['EUR', 'USD', 'JPY', 'GBP', 'CHF', ...]
```

---

## 🧪 TypeScript Support

All methods are fully typed. You can also use:

```ts
import type { Currency } from '@appaka/currapi'
```

---

## 🧑‍💻 Author

- Developed by [javierperez.com](https://javierperez.com) | [@javierperez_com](https://x.com/javierperez_com)
- Powered by [currapi.com](https://currapi.com) | [@CurrAPI_com](https://x.com/CurrAPI_com)
