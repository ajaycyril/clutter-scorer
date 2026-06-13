# Architecture

Clutter Scorer is split into local perception, server-side reasoning, and closed-loop UI verification.

```text
Chrome / Edge camera
  -> Canvas frame sampler
  -> Edge metrics
  -> MediaPipe local object detection
  -> Keyframe selector
  -> Next.js API route
  -> Gemini structured physical reasoning
  -> Zod validation
  -> UI world state, overlays, score, action plan
  -> User changes scene
  -> Rescore / verify
```

## Browser Layer

The browser performs deterministic work before any model call:

- brightness
- contrast
- sharpness proxy
- edge density
- visual complexity
- frame difference
- motion score
- stability
- local object detections

The client sends a keyframe only when the frame is usable, no request is in flight, enough time has passed, and the scene changed enough or the user requested verification.

## Server Layer

`app/api/analyze-frame/route.ts` is the only backend endpoint.

It validates the request with Zod, rejects unusable frames, calls Gemini server-side, validates the structured response, and returns typed errors for invalid input or model output.

The Gemini API key never reaches the browser.

## Reasoning Layer

Gemini receives:

- selected image keyframe
- local detections
- local edge metrics
- previous world state
- baseline analysis when verifying
- selected mode

It returns:

- live commentary
- clutter/readiness score
- subscores
- scene graph / world state
- events
- action plan
- overlays
- verification result

## Why There Is No Mock Mode

This repo intentionally fails clearly when `GEMINI_API_KEY` is not configured. The goal is production behavior, not a simulated demo path.
