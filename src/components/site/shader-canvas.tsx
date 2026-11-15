"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useEffect, useState } from "react";
import type { ShaderVariant } from "./shader-bg";

const PRESETS: Record<ShaderVariant, React.ComponentProps<typeof ShaderGradient>> = {
  hero: {
    type: "waterPlane",
    color1: "#c2412a",
    color2: "#120d0b",
    color3: "#e08a3c",
    uSpeed: 0.14,
    uStrength: 2.2,
    uDensity: 1.3,
    uFrequency: 5.5,
    uAmplitude: 1,
    brightness: 0.75,
    cAzimuthAngle: 180,
    cPolarAngle: 80,
    cDistance: 2.9,
    positionX: 0,
    positionY: 1.6,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 50,
    reflection: 0.1,
  },
  ember: {
    type: "plane",
    color1: "#b8391f",
    color2: "#120d0b",
    color3: "#d9822f",
    uSpeed: 0.12,
    uStrength: 3.4,
    uDensity: 1.2,
    uFrequency: 5.5,
    uAmplitude: 1,
    brightness: 0.7,
    cAzimuthAngle: 180,
    cPolarAngle: 90,
    cDistance: 3.6,
    positionX: -1.4,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 10,
    rotationZ: 50,
    reflection: 0.1,
  },
  dusk: {
    type: "sphere",
    color1: "#a8382a",
    color2: "#5b3f8f",
    color3: "#120d0b",
    uSpeed: 0.1,
    uStrength: 0.4,
    uDensity: 0.8,
    uFrequency: 5.5,
    uAmplitude: 3.2,
    brightness: 0.6,
    cAzimuthAngle: 270,
    cPolarAngle: 180,
    cDistance: 0.5,
    positionX: -0.1,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 130,
    rotationZ: 70,
    reflection: 0.4,
  },
};

export default function ShaderCanvas({ variant }: { variant: ShaderVariant }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 transition-opacity duration-[1600ms]" style={{ opacity: shown ? 0.85 : 0 }}>
      <ShaderGradientCanvas
        style={{ position: "absolute", inset: 0 }}
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
        lazyLoad
        powerPreference="low-power"
      >
        <ShaderGradient control="props" animate="on" lightType="3d" grain="off" {...PRESETS[variant]} />
      </ShaderGradientCanvas>
    </div>
  );
}
