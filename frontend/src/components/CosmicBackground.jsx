import React, { useMemo } from "react";

// Deterministic seed helper so stars stay consistent across renders
function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const CosmicBackground = () => {
  // Generate 150 SVG stars with varying sizes, colors, positions, opacities & slow twinkle groups
  const stars = useMemo(() => {
    const starList = [];
    const colors = [
      "#FFFFFF",
      "#FFFFFF",
      "rgba(255, 255, 255, 0.8)",
      "rgba(255, 255, 255, 0.6)",
      "#F59E0B",
      "#FBBF24",
      "rgba(245, 158, 11, 0.75)",
      "#C4B5FD",
    ];

    for (let i = 0; i < 150; i++) {
      const seed = i * 17 + 101;
      const left = (pseudoRandom(seed) * 100).toFixed(2);
      const top = (pseudoRandom(seed + 1) * 100).toFixed(2);
      const opacity = (0.15 + pseudoRandom(seed + 2) * 0.7).toFixed(2);
      const color = colors[Math.floor(pseudoRandom(seed + 3) * colors.length)];
      const type = pseudoRandom(seed + 4) > 0.88 ? "spark" : "point"; // 12% 4-point SVG sparks, 88% micro SVG points
      const size = type === "spark" ? (3 + pseudoRandom(seed + 5) * 3).toFixed(1) : (0.8 + pseudoRandom(seed + 5) * 1.6).toFixed(1);
      const twinkleGroup = Math.floor(pseudoRandom(seed + 6) * 4); // 4 slow twinkle groups (7s, 9s, 11s, 14s)

      starList.push({
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        opacity,
        color,
        type,
        size: Number(size),
        twinkleClass: `animate-soft-twinkle-${twinkleGroup}`,
      });
    }
    return starList;
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050816] z-0"
    >
      {/* ── Layer 6: Ultra-Light Cinematic Noise Texture ─────────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.018] pointer-events-none mix-blend-overlay">
        <filter id="cinematic-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-noise-filter)" />
      </svg>

      {/* ── Layer 2: Subtle Warm Golden Aura (Top-Right, Opacity < 15%) ──────── */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 40%, transparent 65%)",
          filter: "blur(70px)",
        }}
      />

      {/* ── Layer 3: Second Purple Glow (Bottom-Left, Opacity < 8%) ───────────── */}
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[75vw] h-[75vw] max-w-[950px] max-h-[950px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.07) 0%, rgba(109, 40, 217, 0.015) 45%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* ── Layer 4: Subtle Cyan Glow (Center, Opacity < 4%) ──────────────────── */}
      <div
        className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.035) 0%, rgba(34, 211, 238, 0.008) 35%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Layer 5: 150 Realistic Tiny SVG Stars (Pure CSS + SVG) ──────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <div
            key={s.id}
            className={`absolute ${s.twinkleClass}`}
            style={{
              left: s.left,
              top: s.top,
              opacity: s.opacity,
              width: `${s.size * 2}px`,
              height: `${s.size * 2}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {s.type === "spark" ? (
              // 4-Point Divine SVG Celestial Spark Star
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full"
                style={{ color: s.color }}
              >
                <path
                  d="M12 0 C12 6.6 17.4 12 24 12 C17.4 12 12 17.4 12 24 C12 17.4 6.6 12 0 12 C6.6 12 12 6.6 12 0 Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              // Micro SVG Point Star
              <svg viewBox="0 0 10 10" className="w-full h-full">
                <circle cx="5" cy="5" r="4" fill={s.color} />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* ── Soft, Slow Twinkling CSS Keyframes (No Fast/Cartoon Flickering) ───── */}
      <style>{`
        @keyframes softTwinkle0 {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(0.85); }
          50%      { opacity: 0.85; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes softTwinkle1 {
          0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
          50%      { opacity: 0.25; transform: translate(-50%, -50%) scale(0.8); }
        }
        @keyframes softTwinkle2 {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
          50%      { opacity: 0.75; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes softTwinkle3 {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1.1); }
          50%      { opacity: 0.2; transform: translate(-50%, -50%) scale(0.85); }
        }

        .animate-soft-twinkle-0 {
          animation: softTwinkle0 7s ease-in-out infinite;
        }
        .animate-soft-twinkle-1 {
          animation: softTwinkle1 9s ease-in-out infinite 1.5s;
        }
        .animate-soft-twinkle-2 {
          animation: softTwinkle2 11s ease-in-out infinite 3s;
        }
        .animate-soft-twinkle-3 {
          animation: softTwinkle3 14s ease-in-out infinite 4.5s;
        }
      `}</style>
    </div>
  );
};

export default CosmicBackground;
