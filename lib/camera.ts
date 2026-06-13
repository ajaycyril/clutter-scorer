import type { Mode } from "./types";

export async function listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "videoinput");
}

export function buildVideoConstraints(mode: Mode, deviceId: string | null): MediaStreamConstraints {
  if (deviceId) {
    return {
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    };
  }

  const facingMode = mode === "webcam_coach" ? "user" : "environment";
  return {
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };
}

export function stopStream(stream: MediaStream | null): void {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
}
