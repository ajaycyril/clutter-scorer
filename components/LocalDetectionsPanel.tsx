"use client";

import type { LocalDetection } from "../lib/types";

export function LocalDetectionsPanel({ detections }: { detections: LocalDetection[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Local Detections</h2>
        <span>{detections.length} objects</span>
      </div>
      {detections.length === 0 ? (
        <p className="empty">MediaPipe detections will appear here.</p>
      ) : (
        <div className="chip-list">
          {detections.map((detection, index) => (
            <span key={`${detection.label}-${index}`} className="chip">
              {detection.label} {Math.round(detection.score * 100)}%
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
