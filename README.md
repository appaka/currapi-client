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

This client provides access to historical exchange rate data from [currapi.com](https://currapi.com), using a simple and developer-friendly interface.

### 🔐 Set your API key

Make sure you have a `.env` file or an environment variable defined:

```env
CURRAPI_API_KEY=your_api_key_here
```

Optional:

```env
CURRAPI_VERBOSE_MODE=1
```

This enables logging of rate limit data to the console.

---

## 📅 Get a historical exchange rate

```ts
import { getExchangeRate } from '@appaka/currapi'

const rate = await getExchangeRate({
  date: '2024-03-15',
  base: 'USD',
  target: 'EUR',
})

console.log(rate) // e.g. 0.9234
```

### 🔍 `getExchangeRate(params)`

Returns the exchange rate between a base currency and a target currency on a specific date.

#### Parameters:

- `date`: `string` — in `YYYY-MM-DD` format
- `base`: `string` — ISO 4217 code of the base currency (e.g. `"USD"`)
- `target`: `string` — ISO 4217 code of the target currency (e.g. `"EUR"`)

#### Returns:

- A `number` representing the exchange rate from base to target on the given date.

#### Throws:

- An error if the API key is missing or invalid
- An error if the request fails or data is unavailable

If `CURRAPI_VERBOSE_MODE=true` is set, logs rate limit info to the console.

---

## 💱 Get list of supported currencies

```ts
import { getValidCurrencies } from '@appaka/currapi'

const currencies = await getValidCurrencies()
console.log(currencies)
// ['USD', 'EUR', 'GBP', ...]
```

---

## 🛠️ Features

- ✅ Simple, modern API client
- 🔐 Uses Bearer token authentication via environment variable
- 📅 Date-based historical exchange rates
- 🌍 Supports any valid currency pair
- 📈 Optional rate limit info logging
- 🧪 Fully typed with TypeScript

---

## 🧰 Tech

Built with:

- TypeScript
- Node.js (ES2020+)
- [currapi.com](https://currapi.com) — built by indie makers, for indie makers

---

## 🧑‍💻 Author

Developed by [@javierperez_com](https://x.com/javierperez_com) — indie SaaS builder  
Check out the API: https://currapi.com
