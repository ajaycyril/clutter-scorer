"use client";

import type { AnalysisResponse, LocalDetection } from "../lib/types";

type OverlayLayerProps = {
  analysis: AnalysisResponse | null;
  localDetections: LocalDetection[];
};

function severityClass(severity: string): string {
  if (severity === "high") {
    return "overlay-high";
  }
  if (severity === "positive") {
    return "overlay-positive";
  }
  return "overlay-medium";
}

export function OverlayLayer({ analysis, localDetections }: OverlayLayerProps) {
  const overlays = analysis?.overlays ?? [];
  return (
    <div className="overlay-layer" aria-hidden="true">
      {localDetections.map((detection, index) => (
        <div
          key={`${detection.label}-${index}`}
          className="detection-box"
          style={{
            left: `${detection.x * 100}%`,
            top: `${detection.y * 100}%`,
            width: `${detection.w * 100}%`,
            height: `${detection.h * 100}%`,
          }}
        >
          <span>{detection.label}</span>
        </div>
      ))}
      {overlays.map((overlay, index) => {
        if (overlay.type === "arrow" && overlay.toX !== undefined && overlay.toY !== undefined) {
          return (
            <svg key={`${overlay.label}-${index}`} className="arrow-overlay">
              <line
                x1={`${overlay.x * 100}%`}
                y1={`${overlay.y * 100}%`}
                x2={`${overlay.toX * 100}%`}
                y2={`${overlay.toY * 100}%`}
                className={severityClass(overlay.severity)}
              />
              <text x={`${overlay.toX * 100}%`} y={`${overlay.toY * 100}%`}>
                {overlay.label}
              </text>
            </svg>
          );
        }

        return (
          <div
            key={`${overlay.label}-${index}`}
            className={`model-overlay ${severityClass(overlay.severity)}`}
            style={{
              left: `${overlay.x * 100}%`,
              top: `${overlay.y * 100}%`,
              width: `${(overlay.w ?? 0.18) * 100}%`,
              height: `${(overlay.h ?? 0.09) * 100}%`,
            }}
          >
            <span>{overlay.label}</span>
          </div>
        );
      })}
    </div>
  );
}
