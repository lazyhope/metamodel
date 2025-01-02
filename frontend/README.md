# Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flazyhope%2Fmetamodel)

In your Vercel project settings, you need to config the following:

1. Add environment variable `VITE_API_URL` and set the value to your metamodel backend url.
2. For complex schema definitions and parsing, language models may require multiple attempts. Adjust the default `maxDuration` from 10 seconds to 60 seconds to prevent timeouts during retry attempts.
