import React, { useMemo } from "react";

/**
 * Helper to generate deterministic pseudo-random star coordinates (0vw to 100vw, 0vh to 100vh)
 * Creates a CSS box-shadow string for N stars without any DOM clutter or images.
 */
function generateStarsShadow(count, seedOffset, colors) {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const seed = i + seedOffset;
    // Deterministic random formulas
    const x = (((seed * 9301 + 49297) % 233280) / 233280 * 100).toFixed(2);
    const y = (((seed * 49297 + 9301) % 233280) / 233280 * 100).toFixed(2);
    const color = colors[i % colors.length];
    const blur = i % 3 === 0 ? "1px" : "0px";
    shadows.push(`${x}vw ${y}vh ${blur} ${color}`);
  }
  return shadows.join(", ");
}

const CosmicBackground = () => {
  // Layer 1: 50 Crisp White Stars (Twinkle 4s)
  const starsLayer1 = useMemo(
    () =>
      generateStarsShadow(50, 100, [
        "rgba(255, 255, 255, 0.9)",
        "rgba(255, 255, 255, 0.6)",
        "rgba(255, 255, 255, 0.4)",
      ]),
    []
  );

  // Layer 2: 50 Golden Celestial Stars — Astrotalk Vibe (Twinkle 6s, 1.5s delay)
  const starsLayer2 = useMemo(
    () =>
      generateStarsShadow(50, 500, [
        "rgba(245, 158, 11, 0.85)",
        "rgba(251, 191, 36, 0.65)",
        "rgba(254, 240, 138, 0.5)",
      ]),
    []
  );

  // Layer 3: 50 Deep Purple & Cyan Cosmic Stars (Twinkle 8s, 3s delay)
  const starsLayer3 = useMemo(
    () =>
      generateStarsShadow(50, 900, [
        "rgba(124, 58, 237, 0.75)",
        "rgba(167, 139, 250, 0.6)",
        "rgba(34, 211, 238, 0.7)",
      ]),
    []
  );

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050816] -z-50"
      style={{ isolation: "isolate" }}
    >
      {/* ── Layer 2: Large Radial Golden Glow ────────────────────────────────── */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 45%, transparent 70%)",
          filter: "blur(60px)",
          transform: "translate3d(0,0,0)",
        }}
      />

      {/* ── Layer 3: Large Radial Purple Glow ────────────────────────────────── */}
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] rounded-full pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(109, 40, 217, 0.04) 50%, transparent 75%)",
          filter: "blur(80px)",
          transform: "translate3d(0,0,0)",
        }}
      />

      {/* ── Layer 4: Small Cyan Glow Accent ─────────────────────────────────── */}
      <div
        className="absolute top-[45%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.07) 0%, rgba(34, 211, 238, 0.01) 50%, transparent 70%)",
          filter: "blur(70px)",
          transform: "translate3d(0,0,0)",
        }}
      />

      {/* ── Layer 5 & 6: 150 Randomly Distributed Twinkling Stars (Pure CSS) ── */}
      {/* Star Sub-Layer A (50 White Stars) */}
      <div
        className="absolute top-0 left-0 w-[1px] h-[1px] rounded-full animate-cosmic-twinkle-a"
        style={{
          boxShadow: starsLayer1,
          willChange: "opacity, transform",
        }}
      />

      {/* Star Sub-Layer B (50 Golden Stars) */}
      <div
        className="absolute top-0 left-0 w-[1.5px] h-[1.5px] rounded-full animate-cosmic-twinkle-b"
        style={{
          boxShadow: starsLayer2,
          willChange: "opacity, transform",
        }}
      />

      {/* Star Sub-Layer C (50 Cosmic Purple/Cyan Stars) */}
      <div
        className="absolute top-0 left-0 w-[2px] h-[2px] rounded-full animate-cosmic-twinkle-c"
        style={{
          boxShadow: starsLayer3,
          willChange: "opacity, transform",
        }}
      />

      {/* Custom Twinkle Animations CSS */}
      <style>{`
        @keyframes cosmicTwinkleA {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes cosmicTwinkleB {
          0%, 100% { opacity: 0.9;  transform: scale(1.1);  }
          50%      { opacity: 0.25; transform: scale(0.8);  }
        }
        @keyframes cosmicTwinkleC {
          0%, 100% { opacity: 0.2;  transform: scale(0.8);  }
          50%      { opacity: 0.85; transform: scale(1.2);  }
        }

        .animate-cosmic-twinkle-a {
          animation: cosmicTwinkleA 4s ease-in-out infinite;
        }
        .animate-cosmic-twinkle-b {
          animation: cosmicTwinkleB 6.5s ease-in-out infinite 1.5s;
        }
        .animate-cosmic-twinkle-c {
          animation: cosmicTwinkleC 8s ease-in-out infinite 3.5s;
        }
      `}</style>
    </div>
  );
};

export default CosmicBackground;
