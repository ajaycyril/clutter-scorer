"use client";

type GuardZone = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type ZoneGuardPanelProps = {
  armed: boolean;
  intrusion: boolean;
  zone: GuardZone | null;
  onClear: () => void;
  onStartDrawing: () => void;
};

export function ZoneGuardPanel({ armed, intrusion, zone, onClear, onStartDrawing }: ZoneGuardPanelProps) {
  return (
    <section className={`panel zone-panel ${intrusion ? "zone-alert" : ""}`}>
      <div className="panel-heading">
        <h2>Zone Guard</h2>
        <span>{intrusion ? "person in zone" : zone ? "armed" : "draw a zone"}</span>
      </div>

      <p className="panel-note">
        Draw a camera zone and the browser raises an alert when local person detection enters it. This runs at the edge without a Gemini call.
      </p>

      <div className="zone-actions">
        <button className={armed ? "active-zone-button" : ""} onClick={onStartDrawing} type="button">
          {zone ? "Redraw zone" : "Draw zone"}
        </button>
        <button disabled={!zone} onClick={onClear} type="button">
          Clear
        </button>
      </div>

      {zone ? (
        <div className="zone-readout">
          <strong>{intrusion ? "Alert active" : "Monitoring"}</strong>
          <span>
            x {Math.round(zone.x * 100)}%, y {Math.round(zone.y * 100)}%, w {Math.round(zone.w * 100)}%, h{" "}
            {Math.round(zone.h * 100)}%
          </span>
        </div>
      ) : null}
    </section>
  );
}
