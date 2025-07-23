# Supabase Setup for LilyGem

## Why Supabase?

✅ **Perfect for your use case:**

- Real-time capabilities for live charts
- Row Level Security (RLS) for user data
- Built-in auth integration
- PostgreSQL with JSONB support
- Generous free tier

## Environment Variables

Add these to your `.env.local` and Vercel project:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Exchange Rate API
EXCHANGE_RATE_API_KEY=your-api-key-here

# Cron job
CRON_SECRET=your-secret-key-here
```

## Database Setup

1. **Create Supabase project** at https://supabase.com
2. **Run the schema** from `SUPABASE_SCHEMA.sql` in your Supabase SQL editor
3. **Get your keys** from Settings > API

## API Endpoints

### Exchange Rate API

```
GET /api/exchange-rate?startDate=2024-01-01&endDate=2024-01-31&base=USD&symbols=CAD,EUR
```

**Features:**

- Checks database first
- Fills missing dates with API calls
- Stores new data automatically
- Returns complete historical data
- Single endpoint for current and historical rates

### User Transactions API

```
GET /api/transactions?startDate=2024-01-01&baseCurrency=USD&targetCurrency=CAD
POST /api/transactions
```

**Features:**

- User-specific transactions
- Row Level Security
- Filter by date/currency

## Database Schema

### exchange_rate_pairs

- `date` - Date of exchange rate
- `base_currency` - Base currency (USD, CAD, etc.)
- `target_currency` - Target currency (CAD, EUR, etc.)
- `rate` - Exchange rate value
- `created_at` - Timestamp

### user_transactions

- `user_id` - References auth.users
- `date` - Transaction date
- `base_currency` / `target_currency` - Currencies
- `base_amount` / `target_amount` - Amounts
- `exchange_rate` - Rate used
- `transaction_type` - buy/sell/transfer
- `description` - Optional notes

## Usage Examples

### Frontend - Get Historical Data

```typescript
const response = await fetch("/api/exchange-rate?startDate=2024-01-01&base=USD&symbols=CAD");
const data = await response.json();
// data.rates contains all historical rates
```

### Frontend - Add Transaction

```typescript
const response = await fetch("/api/transactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: "2024-01-15",
    baseCurrency: "USD",
    targetCurrency: "CAD",
    baseAmount: 1000,
    targetAmount: 1350,
    exchangeRate: 1.35,
    transactionType: "buy",
    description: "Monthly investment",
  }),
});
```

## Next Steps

1. **Deploy to Vercel** - Cron job will start running daily
2. **Test the APIs** - Use the examples above
3. **Build frontend** - Use the enhanced API for charts
4. **Add transaction UI** - Let users track their trades

## Monitoring

- Check Vercel Function logs for cron execution
- Monitor Supabase dashboard for data growth
- Set up alerts for failed API calls
