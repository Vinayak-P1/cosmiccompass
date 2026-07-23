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
      {stars.map((star) => (
        <span key={star.id} className={star.className} style={star.style} />
      ))}

      <style>{`
        /* Deep space background with subtle localized golden/amber cosmic auras */
        .stars-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          background-color: #050816;
          background-image: 
            radial-gradient(750px 480px at 85% 15%, rgba(245, 158, 11, 0.14), rgba(5, 8, 22, 0) 65%), 
            radial-gradient(650px 400px at 10% 85%, rgba(217, 119, 6, 0.09), rgba(5, 8, 22, 0) 60%), 
            radial-gradient(550px 350px at 95% 65%, rgba(245, 158, 11, 0.07), rgba(5, 8, 22, 0) 55%),
            radial-gradient(500px 320px at 15% 30%, rgba(251, 191, 36, 0.05), rgba(5, 8, 22, 0) 50%);
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
