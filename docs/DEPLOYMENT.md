# Deployment

## Environment Variables

Required:

```bash
GEMINI_API_KEY=
```

Optional:

```bash
GEMINI_MODEL=gemini-2.5-flash
```

## Vercel

The app is a standard Next.js project. Import the GitHub repository into Vercel, then add the environment variables above.

The API route is:

```text
app/api/analyze-frame/route.ts
```

It runs as a Vercel-compatible Node.js route handler.

## Local Verification

```bash
npm run build
npm run dev
```

Use Chrome or Edge. Camera access requires HTTPS or localhost.

## Model Asset

The local browser detector expects:

```text
public/models/efficientdet_lite0.tflite
```

If the file is missing, local detection fails clearly.
