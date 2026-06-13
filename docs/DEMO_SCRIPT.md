# Demo Script

## Core Positioning

Clutter Scorer is a browser-native physical AI demo.

The camera acts like a robot sensor. The browser performs local perception on stable video frames. Gemini API handles multimodal reasoning and structured output, turning the frame into a world state, readiness score, commentary, and physical action plan. The user is the actuator, and Rescore closes the loop by checking whether the physical scene improved.

```text
Observe -> Perceive -> Model -> Plan -> Act -> Verify
```

## 30 Second Instagram Reel

**Shot 1: Phone in hand, pointing at a desk.**

"I was testing the Gemini API, and I wanted to see what it means for physical AI, not just chat."

**Shot 2: Tap Start camera scan.**

"So I built Clutter Scorer. You point your camera at any space, like a desk, shelf, or room corner."

**Shot 3: Show score, commentary, edge hints, and action plan in the first screen.**

"The browser does local video analytics, then Gemini reads a stable keyframe and returns a world model: what is there, what it means physically, and what action would improve it."

**Shot 4: Move one object, tap Rescore.**

"This is the robotics loop: observe, plan, act, verify. The human is the actuator."

**Closing line.**

"Physical AI is not just robots walking around. It is AI that understands the state of the real world and helps change it."

## 60 Second LinkedIn Video

**Opening.**

"I have been testing the Gemini API beyond normal chatbot use cases. Gemini is Google's multimodal AI API: it can reason over text and images, and it can return structured outputs that an application can use directly."

**Show the app.**

"This is Clutter Scorer, a browser-based physical AI demo. No app install. Just open the URL, point the camera at a real space, and start scanning."

**Explain the loop.**

"The browser acts like a lightweight robot perception stack. It captures camera frames, checks brightness, sharpness, motion, visual complexity, and high-confidence edge hints. Then the server sends a selected stable frame to Gemini."

**Show UI output.**

"Gemini returns a structured world state, a readiness score, live commentary, overlays, and an action plan. For example: move a drink away from electronics, clear the focus zone, route a cable, or improve the webcam background."

**Show baseline/rescore.**

"The important part is verification. I can set a baseline, physically change the environment, and rescore. That turns it from image captioning into a small closed-loop physical AI system."

**Security / production note.**

"The API key stays server-side, requests are capped for demo use, oversized payloads are rejected, and the UI is designed for quick public demos on mobile or laptop."

**Closing.**

"This is where physical AI gets interesting: not only generating text, but sensing real spaces, building world state, planning actions, and verifying change."

## Demo Operator Checklist

1. Open `https://clutter-scorer.vercel.app` on phone or laptop.
2. Say: "Point the camera at any physical space and the app recommends how to improve it."
3. Tap **Start camera scan**.
4. Hold the camera still for a few seconds.
5. Narrate the first fold: score, live commentary, edge hints, and action plan.
6. Tap **Set baseline** after the first good result.
7. Move one obvious object, such as a cup, cable, paper stack, or background clutter.
8. Tap **Rescore**.
9. Explain: "This is observe, plan, act, verify."

## Talking Points

- Gemini API is the multimodal reasoning layer.
- Browser video analytics select stable, usable keyframes before model calls.
- MediaPipe detections are treated as weak edge hints, not ground truth.
- The output is structured JSON, not a loose caption.
- The UI exposes robotics concepts: sensor input, world state, affordances, action plan, and verification.
- Demo limits protect the public endpoint from accidental API overuse.
- No Gemini API key is exposed to the browser.

## Avoid Saying

- Do not say the app is fully autonomous robotics.
- Do not say it continuously streams video to Gemini.
- Do not show environment variables, Vercel settings, or API keys.
- Do not overclaim object detection accuracy. Say the model reasons over stable frames and uses browser detections as hints.
