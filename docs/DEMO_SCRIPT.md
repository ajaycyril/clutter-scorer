# Demo Script

## Positioning

Clutter Scorer is a human-in-the-loop physical AI agent.

The browser is the sensor. Chrome runs edge video analytics. Gemini builds the world state and action plan. The user acts as the actuator. Rescore verifies the changed physical state.

## Laptop Webcam Demo

1. Open the app in Chrome or Edge.
2. Select **Webcam Coach**.
3. Start the camera.
4. Start scan.
5. Let it analyze lighting, framing, background clutter, and visible distractions.
6. Set baseline.
7. Move one background item or adjust lighting.
8. Click Rescore.
9. Show the score delta and resolved/remaining list.

## Desk Demo

1. Select **Desk Productivity**.
2. Point the camera at a desk with a few visible objects.
3. Start scan.
4. Show local detections and edge metrics updating before Gemini responds.
5. Set baseline.
6. Move a cup, clear papers, or route a cable.
7. Rescore.
8. Explain the loop:

```text
Observe -> Detect -> Model -> Plan -> Verify
```

## Talking Points

- This is not continuous API spam. The browser selects stable keyframes.
- MediaPipe performs local object detection in the browser.
- Gemini receives sensor signals and performs physical reasoning.
- The UI shows a world state, not just a caption.
- The rescore step closes the loop.
