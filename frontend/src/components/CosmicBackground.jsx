import React, { useMemo } from "react";

// Helper for deterministic pseudo-random values
function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const CosmicBackground = () => {
  // Generate 60 HTML span star elements matching Astrotalk's twinkle effect
  const stars = useMemo(() => {
    const starList = [];
    for (let i = 0; i < 60; i++) {
      const seed = i * 13 + 7;
      const top = (pseudoRandom(seed) * 100).toFixed(4);
      const left = (pseudoRandom(seed + 1) * 100).toFixed(4);
      const duration = (2 + pseudoRandom(seed + 2) * 3).toFixed(2);
      const delay = (pseudoRandom(seed + 3) * 5).toFixed(2);
      const isGold = pseudoRandom(seed + 4) > 0.75;
      const isBig = pseudoRandom(seed + 5) > 0.85;

      let className = "v2-star";
      if (isGold) className += " v2-star-gold";
      if (isBig) className += " v2-star-big";

      starList.push({
        id: i,
        className,
        style: {
          top: `${top}%`,
          left: `${left}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        },
      });
    }
    return starList;
  }, []);

  return (
    <div aria-hidden="true" className="stars-container">
      {/* ── Background Star Overlay (Calibrated 35% Density Opacity) ── */}
      <div className="absolute inset-0 opacity-35 pointer-events-none">
        {stars.map((star) => (
          <span key={star.id} className={star.className} style={star.style} />
        ))}
      </div>

      {/* ── Radial Vignette Overlay (Darkens edges to lock focus on center hero) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(5, 5, 10, 0) 30%, rgba(5, 5, 10, 0.65) 85%, rgba(5, 5, 10, 0.95) 100%)",
        }}
      />

      <style>{`
        /* Deep Obsidian background with 2 large cinematic ambient light sources */
        .stars-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          background-color: #05050A;
          background-image: 
            radial-gradient(1200px 750px at 85% 10%, rgba(212, 175, 55, 0.12), rgba(5, 5, 10, 0) 70%), 
            radial-gradient(900px 600px at 10% 90%, rgba(124, 58, 237, 0.07), rgba(5, 5, 10, 0) 65%);
        }

        /* Star base styling */
        .v2-star {
          position: absolute;
          display: block;
          width: 2px;
          height: 2px;
          background-color: #ffffff;
          border-radius: 50%;
          animation: v2-twinkle ease-in-out infinite;
        }

        /* Star variants */
        .v2-star-gold {
          background-color: rgb(232, 196, 112);
        }

        .v2-star-big {
          width: 3px;
          height: 3px;
        }

        /* Twinkle keyframe animation */
        @keyframes v2-twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default CosmicBackground;
