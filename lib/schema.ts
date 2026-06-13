import { z } from "zod";

const scoreSchema = z.number().finite().min(0).max(100);
const normalizedSchema = z.number().finite().min(0).max(1);

export const modeSchema = z.enum(["space_scan", "desk_productivity", "webcam_coach"]);
export const scanPhaseSchema = z.enum(["observe", "baseline", "verify"]);

export const edgeMetricsSchema = z.object({
  brightness: scoreSchema,
  contrast: scoreSchema,
  sharpness: scoreSchema,
  edgeDensity: scoreSchema,
  visualComplexity: scoreSchema,
  frameDifference: scoreSchema,
  motionScore: scoreSchema,
  stability: scoreSchema,
  usable: z.boolean(),
  rejectionReason: z.string().nullable(),
});

export const localDetectionSchema = z.object({
  label: z.string().min(1),
  score: normalizedSchema,
  x: normalizedSchema,
  y: normalizedSchema,
  w: normalizedSchema,
  h: normalizedSchema,
});

export const worldStateSchema = z.object({
  summary: z.string().min(1),
  objects: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      location: z.string().min(1),
      affordance: z.string().min(1),
      movable: z.boolean(),
      source: z.enum(["local_detection", "gemini_reasoning"]),
    }),
  ),
  relationships: z.array(
    z.object({
      subject: z.string().min(1),
      relation: z.string().min(1),
      object: z.string().min(1),
      implication: z.string().min(1),
    }),
  ),
});

export const analysisResponseSchema = z.object({
  commentary: z.string().min(1).max(220),
  score: scoreSchema,
  scoreLabel: z.string().min(1),
  subscores: z.object({
    surfaceClarity: scoreSchema,
    objectGrouping: scoreSchema,
    spillRisk: scoreSchema,
    cableMess: scoreSchema,
    focusZone: scoreSchema,
    visualCalm: scoreSchema,
    lighting: scoreSchema,
    framing: scoreSchema,
    detectionConfidence: scoreSchema,
  }),
  worldState: worldStateSchema,
  events: z.array(z.string()),
  actions: z.array(
    z.object({
      priority: z.number().int().min(1).max(10),
      instruction: z.string().min(1),
      reason: z.string().min(1),
      expectedGain: z.number().finite().min(0).max(100),
      status: z.enum(["pending", "resolved", "unknown"]),
    }),
  ),
  overlays: z.array(
    z.object({
      type: z.enum(["zone", "label", "arrow", "detection"]),
      label: z.string().min(1),
      severity: z.enum(["low", "medium", "high", "positive"]),
      x: normalizedSchema,
      y: normalizedSchema,
      w: normalizedSchema.optional(),
      h: normalizedSchema.optional(),
      toX: normalizedSchema.optional(),
      toY: normalizedSchema.optional(),
    }),
  ),
  verification: z.object({
    baselineScore: scoreSchema.nullable(),
    currentScore: scoreSchema,
    predictedScore: scoreSchema.nullable(),
    delta: z.number().finite().min(-100).max(100).nullable(),
    resolved: z.array(z.string()),
    remaining: z.array(z.string()),
  }),
});

export const analyzeFrameRequestSchema = z.object({
  frameBase64: z.string().min(1),
  mode: modeSchema,
  scanPhase: scanPhaseSchema,
  previousWorldState: worldStateSchema.nullable(),
  baseline: analysisResponseSchema.nullable(),
  edgeMetrics: edgeMetricsSchema,
  localDetections: z.array(localDetectionSchema).max(20),
});

export const geminiResponseJsonSchema = {
  type: "object",
  properties: {
    commentary: { type: "string" },
    score: { type: "number" },
    scoreLabel: { type: "string" },
    subscores: {
      type: "object",
      properties: {
        surfaceClarity: { type: "number" },
        objectGrouping: { type: "number" },
        spillRisk: { type: "number" },
        cableMess: { type: "number" },
        focusZone: { type: "number" },
        visualCalm: { type: "number" },
        lighting: { type: "number" },
        framing: { type: "number" },
        detectionConfidence: { type: "number" },
      },
      required: ["surfaceClarity", "objectGrouping", "spillRisk", "cableMess", "focusZone", "visualCalm", "lighting", "framing", "detectionConfidence"],
    },
    worldState: {
      type: "object",
      properties: {
        summary: { type: "string" },
        objects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              location: { type: "string" },
              affordance: { type: "string" },
              movable: { type: "boolean" },
              source: { type: "string", enum: ["local_detection", "gemini_reasoning"] },
            },
            required: ["id", "label", "location", "affordance", "movable", "source"],
          },
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subject: { type: "string" },
              relation: { type: "string" },
              object: { type: "string" },
              implication: { type: "string" },
            },
            required: ["subject", "relation", "object", "implication"],
          },
        },
      },
      required: ["summary", "objects", "relationships"],
    },
    events: { type: "array", items: { type: "string" } },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          priority: { type: "number" },
          instruction: { type: "string" },
          reason: { type: "string" },
          expectedGain: { type: "number" },
          status: { type: "string", enum: ["pending", "resolved", "unknown"] },
        },
        required: ["priority", "instruction", "reason", "expectedGain", "status"],
      },
    },
    overlays: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["zone", "label", "arrow", "detection"] },
          label: { type: "string" },
          severity: { type: "string", enum: ["low", "medium", "high", "positive"] },
          x: { type: "number" },
          y: { type: "number" },
          w: { type: "number" },
          h: { type: "number" },
          toX: { type: "number" },
          toY: { type: "number" },
        },
        required: ["type", "label", "severity", "x", "y"],
      },
    },
    verification: {
      type: "object",
      properties: {
        baselineScore: { type: ["number", "null"] },
        currentScore: { type: "number" },
        predictedScore: { type: ["number", "null"] },
        delta: { type: ["number", "null"] },
        resolved: { type: "array", items: { type: "string" } },
        remaining: { type: "array", items: { type: "string" } },
      },
      required: ["baselineScore", "currentScore", "predictedScore", "delta", "resolved", "remaining"],
    },
  },
  required: ["commentary", "score", "scoreLabel", "subscores", "worldState", "events", "actions", "overlays", "verification"],
} as const;
