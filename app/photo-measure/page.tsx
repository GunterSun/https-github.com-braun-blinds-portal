"use client";

import { PhotoVoiceMeasureApp } from "@/lib/photo-voice-measure-app";

export default function PhotoMeasureStandalonePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f0e9",
        padding: "12px",
        fontFamily: 'Arial, "PingFang SC", sans-serif',
      }}
    >
      <PhotoVoiceMeasureApp standalone />
    </main>
  );
}

