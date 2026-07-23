import React, { useMemo } from "react";

function generateStarsShadow(count, seedOffset, colors) {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const seed = i + seedOffset;
    const x = (((seed * 9301 + 49297) % 233280) / 233280 * 100).toFixed(2);
    const y = (((seed * 49297 + 9301) % 233280) / 233280 * 100).toFixed(2);
    const color = colors[i % colors.length];
    shadows.push(`${x}vw ${y}vh 0px 0.8px ${color}`);
  }
  return shadows.join(", ");
}

const CosmicBackground = () => {
  // Layer 1: 50 Crisp White Stars
  const starsLayer1 = useMemo(
    () =>
      generateStarsShadow(50, 100, [
        "#FFFFFF",
        "rgba(255, 255, 255, 0.85)",
        "rgba(255, 255, 255, 0.6)",
      ]),
    []
  );

  // Layer 2: 50 Golden Celestial Stars (Astrotalk Gold Vibe)
  const starsLayer2 = useMemo(
    () =>
      generateStarsShadow(50, 500, [
        "#F59E0B",
        "#FBBF24",
        "rgba(245, 158, 11, 0.8)",
      ]),
    []
  );

  // Layer 3: 50 Purple & Cyan Cosmic Stars
  const starsLayer3 = useMemo(
    () =>
      generateStarsShadow(50, 900, [
        "#7C3AED",
        "#A78BFA",
        "#22D3EE",
      ]),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050816] z-0"
    >
      {/* Large Radial Golden Glow (Astrotalk Aura) */}
      <div
        className="absolute top-[-5%] right-[-5%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0.04) 45%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Large Radial Purple Glow */}
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[75vw] h-[75vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, rgba(109, 40, 217, 0.05) 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
      />

      {/* Small Cyan Glow Accent */}
      <div
        className="absolute top-[50%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.02) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* 150 Twinkling Stars (Pure CSS) */}
      <div
        className="absolute top-0 left-0 w-[2px] h-[2px] rounded-full animate-cosmic-twinkle-a"
        style={{ boxShadow: starsLayer1 }}
      />
      <div
        className="absolute top-0 left-0 w-[2px] h-[2px] rounded-full animate-cosmic-twinkle-b"
        style={{ boxShadow: starsLayer2 }}
      />
      <div
        className="absolute top-0 left-0 w-[2.5px] h-[2.5px] rounded-full animate-cosmic-twinkle-c"
        style={{ boxShadow: starsLayer3 }}
      />

      <style>{`
        @keyframes cosmicTwinkleA {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes cosmicTwinkleB {
          0%, 100% { opacity: 0.95; transform: scale(1.2); }
          50%      { opacity: 0.2;  transform: scale(0.7); }
        }
        @keyframes cosmicTwinkleC {
          0%, 100% { opacity: 0.25; transform: scale(0.7); }
          50%      { opacity: 0.9;  transform: scale(1.25); }
        }

        .animate-cosmic-twinkle-a {
          animation: cosmicTwinkleA 3.5s ease-in-out infinite;
        }
        .animate-cosmic-twinkle-b {
          animation: cosmicTwinkleB 5.5s ease-in-out infinite 1.2s;
        }
        .animate-cosmic-twinkle-c {
          animation: cosmicTwinkleC 7s ease-in-out infinite 2.8s;
        }
      `}</style>
    </div>
  );
};

export default CosmicBackground;
