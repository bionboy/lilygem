<img width="5088" height="4510" alt="image" src="https://github.com/user-attachments/assets/101d1591-cb61-4002-9b34-6f79565a8489" />


A currency converter that goes beyond simple conversion.

Track your international transfers, analyze historical rates, compare service providers, and get AI-powered recommendations to optimize your currency exchanges.

Features include real-time conversion, interactive historical charts, transaction cost tracking, and data export capabilities.

## Environment

Use Infisical for local secret injection:

```sh
bun run dev:secrets
```

Use `bun run env:pull:infisical` to write Infisical secrets to `.env.local`, or `bun run env:pull:vercel` when syncing from Vercel. Keep Vercel production env vars in sync separately unless Infisical is wired to push to Vercel.
