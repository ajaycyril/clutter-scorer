# Implementation Notes

## Project Structure

```text
app/
  api/analyze-frame/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  CameraScanner.tsx
  CapabilityGate.tsx
  OverlayLayer.tsx
  panels...
lib/
  browserCapabilities.ts
  camera.ts
  edgeMetrics.ts
  gemini.ts
  mediaPipeDetector.ts
  prompts.ts
  schema.ts
  types.ts
public/models/
  efficientdet_lite0.tflite
```

## Design Choices

- Chrome/Edge only so browser-side inference and capability checks are honest.
- No regex parsing or markdown scraping for model output.
- No mock model responses.
- No client-side Gemini key.
- Edge metrics run every 500 ms while scanning.
- MediaPipe detection runs sub-second for responsive edge hints.
- Gemini requests are keyframe-gated to avoid API spam.
- Gemini keyframes are downscaled to reduce request latency and payload size.
- Gemini usage metadata is attached to the validated response for visible token and estimated cost telemetry.

## Main Contracts

The shared response contract lives in:

```text
lib/schema.ts
```

The physical AI prompt lives in:

```text
lib/prompts.ts
```

The server-side model integration lives in:

```text
lib/gemini.ts
```
