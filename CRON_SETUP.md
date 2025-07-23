# Exchange Rate Cron Job Setup

This setup allows you to automatically fetch exchange rates daily and store them in your database.

## Files Created

- `src/app/api/cron/exchange-rates/route.ts` - Cron job endpoint
- `src/lib/database.ts` - Database utilities
- `vercel.json` - Vercel cron configuration

## Environment Variables

Add these to your `.env.local` and Vercel project:

```bash
CRON_SECRET=your-secret-key-here
```

## Database Setup

Choose one of these database options:

### Option 1: PostgreSQL (Vercel Postgres)

1. Install the package:

```bash
pnpm add @vercel/postgres
```

2. Uncomment the PostgreSQL code in `src/lib/database.ts`

3. Create the table in your Vercel Postgres database:

```sql
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  base_currency VARCHAR(3) NOT NULL,
  rates JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, base_currency)
);
```

### Option 2: MongoDB

1. Install the package:

```bash
pnpm add mongodb
```

2. Add environment variable:

```bash
MONGODB_URI=your-mongodb-connection-string
```

3. Uncomment the MongoDB code in `src/lib/database.ts`

### Option 3: Supabase

1. Install the package:

```bash
pnpm add @supabase/supabase-js
```

2. Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Create the table in Supabase:

```sql
CREATE TABLE exchange_rates (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  base_currency VARCHAR(3) NOT NULL,
  rates JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, base_currency)
);
```

4. Uncomment the Supabase code in `src/lib/database.ts`

## Deployment

1. Deploy to Vercel
2. The cron job will run daily at 9 AM UTC
3. Check Vercel logs to verify it's working

## Manual Testing

Test the endpoint locally:

```bash
curl -H "Authorization: Bearer your-secret-key" http://localhost:3000/api/cron/exchange-rates
```

## Monitoring

- Check Vercel Function logs for cron job execution
- Monitor your database for new records
- Set up alerts for failed executions
