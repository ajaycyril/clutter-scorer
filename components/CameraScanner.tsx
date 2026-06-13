"use client";

import { AlertTriangle, Camera, Pause, RotateCcw, ScanLine, Target } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionPlanPanel } from "./ActionPlanPanel";
import { CommentaryPanel, type CommentaryItem } from "./CommentaryPanel";
import { EdgeMetricsPanel } from "./EdgeMetricsPanel";
import { LocalDetectionsPanel } from "./LocalDetectionsPanel";
import { ModeSelector } from "./ModeSelector";
import { OverlayLayer } from "./OverlayLayer";
import { ScorePanel } from "./ScorePanel";
import { VerificationPanel } from "./VerificationPanel";
import { WorldStatePanel } from "./WorldStatePanel";
import { buildVideoConstraints, listVideoInputDevices, stopStream } from "@/lib/camera";
import { canvasToJpegDataUrl, captureVideoFrame, computeEdgeMetrics, type EdgeMetricResult } from "@/lib/edgeMetrics";
import { createObjectDetector, detectObjectsForVideo } from "@/lib/mediaPipeDetector";
import type { AnalysisResponse, AppMode, EdgeMetrics, LocalDetection, ScanPhase } from "@/lib/types";

type ApiError = {
  error?: string;
  detail?: string;
};

const GEMINI_INTERVAL_MS = 2200;
const DETECTION_INTERVAL_MS = 900;
const EDGE_INTERVAL_MS = 420;

function readableError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected scanner error.";
}

function isApiError(value: unknown): value is ApiError {
  return Boolean(value && typeof value === "object" && ("error" in value || "detail" in value));
}

function nowLabel(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function CameraScanner({ hasGeminiKey }: { hasGeminiKey: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousFrameRef = useRef<EdgeMetricResult["snapshot"] | null>(null);
  const previousAnalysisRef = useRef<AnalysisResponse | null>(null);
  const baselineRef = useRef<AnalysisResponse | null>(null);
  const localDetectionsRef = useRef<LocalDetection[]>([]);
  const pendingGeminiRef = useRef(false);
  const lastGeminiAtRef = useRef(0);
  const lastDetectionAtRef = useRef(0);

  const [mode, setMode] = useState<AppMode>("desk_productivity");
  const [scanPhase, setScanPhase] = useState<ScanPhase>("observe");
  const [running, setRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<EdgeMetrics | null>(null);
  const [detections, setDetections] = useState<LocalDetection[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [baseline, setBaseline] = useState<AnalysisResponse | null>(null);
  const [commentary, setCommentary] = useState<CommentaryItem[]>([]);

  useEffect(() => {
    previousAnalysisRef.current = analysis;
  }, [analysis]);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);

  useEffect(() => {
    localDetectionsRef.current = detections;
  }, [detections]);

  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
    };
  }, []);

  const refreshDevices = useCallback(async () => {
    const videoDevices = await listVideoInputDevices();
    setDevices(videoDevices);
    if (!selectedDeviceId && videoDevices[0]?.deviceId) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(async () => {
    setStarting(true);
    setError(null);
    setStatus("starting camera");
    try {
      await createObjectDetector();
      stopStream(streamRef.current);
      const stream = await navigator.mediaDevices.getUserMedia(buildVideoConstraints(mode, selectedDeviceId));
      streamRef.current = stream;
      if (!videoRef.current) {
        throw new Error("Video element is not ready.");
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      await refreshDevices();
      previousFrameRef.current = null;
      setRunning(true);
      setStatus(hasGeminiKey ? "edge loop active" : "missing GEMINI_API_KEY");
    } catch (startError) {
      setRunning(false);
      setStatus("camera stopped");
      setError(readableError(startError));
    } finally {
      setStarting(false);
    }
  }, [hasGeminiKey, mode, refreshDevices, selectedDeviceId]);

  const stopCamera = useCallback(() => {
    setRunning(false);
    setStatus("paused");
    stopStream(streamRef.current);
    streamRef.current = null;
  }, []);

  const resetSession = useCallback(() => {
    previousFrameRef.current = null;
    previousAnalysisRef.current = null;
    baselineRef.current = null;
    localDetectionsRef.current = [];
    pendingGeminiRef.current = false;
    lastGeminiAtRef.current = 0;
    lastDetectionAtRef.current = 0;
    setMetrics(null);
    setDetections([]);
    setAnalysis(null);
    setBaseline(null);
    setCommentary([]);
    setScanPhase("observe");
    setError(null);
    setStatus(running ? "edge loop active" : "idle");
  }, [running]);

  const runGeminiAnalysis = useCallback(
    async (edgeMetrics: EdgeMetrics, frameBase64: string) => {
      if (!hasGeminiKey) {
        setError("GEMINI_API_KEY is missing. Add it to Vercel or .env.local before running model reasoning.");
        return;
      }

      pendingGeminiRef.current = true;
      setStatus("gemini physical reasoning");
      try {
        const response = await fetch("/api/analyze-frame", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            frameBase64,
            mode,
            scanPhase,
            previousWorldState: previousAnalysisRef.current?.worldState ?? null,
            baseline: baselineRef.current,
            edgeMetrics,
            localDetections: localDetectionsRef.current,
          }),
        });

        const payload: unknown = await response.json();
        if (!response.ok) {
          if (isApiError(payload)) {
            throw new Error(payload.detail ?? payload.error ?? "Gemini route failed.");
          }
          throw new Error("Gemini route failed.");
        }

        const nextAnalysis = payload as AnalysisResponse;
        setAnalysis(nextAnalysis);
        previousAnalysisRef.current = nextAnalysis;
        setCommentary((items) => [{ time: nowLabel(), text: nextAnalysis.commentary }, ...items].slice(0, 8));
        setStatus("edge loop active");
      } catch (analysisError) {
        setError(readableError(analysisError));
        setStatus("analysis error");
      } finally {
        pendingGeminiRef.current = false;
      }
    },
    [hasGeminiKey, mode, scanPhase],
  );

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      const imageData = captureVideoFrame(video, canvas);
      if (!imageData) {
        return;
      }

      const result = computeEdgeMetrics(imageData, previousFrameRef.current);
      previousFrameRef.current = result.snapshot;
      setMetrics(result.metrics);

      const now = performance.now();
      if (now - lastDetectionAtRef.current >= DETECTION_INTERVAL_MS) {
        lastDetectionAtRef.current = now;
        detectObjectsForVideo(video, now)
          .then((nextDetections) => {
            localDetectionsRef.current = nextDetections;
            setDetections(nextDetections);
          })
          .catch((detectionError) => {
            setError(readableError(detectionError));
          });
      }

      const shouldAnalyze =
        result.metrics.usable &&
        !pendingGeminiRef.current &&
        now - lastGeminiAtRef.current >= GEMINI_INTERVAL_MS;

      if (shouldAnalyze) {
        lastGeminiAtRef.current = now;
        runGeminiAnalysis(result.metrics, canvasToJpegDataUrl(canvas));
      }
    }, EDGE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [runGeminiAnalysis, running]);

  const captureBaseline = useCallback(() => {
    if (!analysis) {
      setError("Run one successful analysis before capturing a baseline.");
      return;
    }
    baselineRef.current = analysis;
    setBaseline(analysis);
    setScanPhase("verify");
    setCommentary((items) => [{ time: nowLabel(), text: `Baseline locked at ${Math.round(analysis.score)}.` }, ...items]);
  }, [analysis]);

  const requestRescore = useCallback(() => {
    lastGeminiAtRef.current = 0;
    setScanPhase(baselineRef.current ? "verify" : "observe");
    setStatus("waiting for next usable keyframe");
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Physical AI browser demo</p>
          <h1>Clutter Scorer</h1>
        </div>
        <div className="loop" aria-label="AI loop">
          <span>camera sensor</span>
          <span>edge metrics</span>
          <span>local object detection</span>
          <span>Gemini world model</span>
          <span>action verification</span>
        </div>
      </header>

      <ModeSelector disabled={running} onChange={setMode} value={mode} />

      <section className="scanner-grid">
        <div className="camera-card">
          <div className="camera-frame">
            <video muted playsInline ref={videoRef} />
            <OverlayLayer analysis={analysis} />
            <div className="camera-status">{status}</div>
          </div>
          <canvas className="hidden-canvas" ref={canvasRef} />

          <div className="control-bar">
            <button disabled={starting || running} onClick={startCamera} type="button">
              <Camera size={16} /> Start camera
            </button>
            <button disabled={!running} onClick={stopCamera} type="button">
              <Pause size={16} /> Pause
            </button>
            <button disabled={!running} onClick={captureBaseline} type="button">
              <Target size={16} /> Set baseline
            </button>
            <button disabled={!running} onClick={requestRescore} type="button">
              <ScanLine size={16} /> Rescore
            </button>
            <button onClick={resetSession} type="button">
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          {devices.length > 0 ? (
            <label className="device-select">
              Camera
              <select
                disabled={running}
                onChange={(event) => setSelectedDeviceId(event.target.value || null)}
                value={selectedDeviceId ?? ""}
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {!hasGeminiKey ? (
            <div className="inline-error">
              <AlertTriangle size={18} />
              <p>GEMINI_API_KEY is not configured. Edge analytics will initialize, but server reasoning will not run.</p>
            </div>
          ) : null}

          {error ? (
            <div className="inline-error">
              <AlertTriangle size={18} />
              <p>{error}</p>
            </div>
          ) : null}
        </div>

        <div className="right-rail">
          <ScorePanel analysis={analysis} />
          <CommentaryPanel items={commentary} status={status} />
          <ActionPlanPanel analysis={analysis} />
        </div>
      </section>

      <section className="panel-grid">
        <EdgeMetricsPanel metrics={metrics} />
        <LocalDetectionsPanel detections={detections} />
        <WorldStatePanel events={analysis?.events ?? []} worldState={analysis?.worldState ?? null} />
        <VerificationPanel analysis={analysis} baseline={baseline} />
      </section>
    </main>
  );
}
