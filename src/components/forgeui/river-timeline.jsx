import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

export default function RiverTimeline({ events = [] }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [pathData, setPathData] = useState("");
  const [svgHeight, setSvgHeight] = useState(0);

  const SVG_WIDTH = 800; // Wider for diagonal winding
  const STEP_HEIGHT = 160;

  useEffect(() => {
    if (!events.length) return;

    // 1. Generate the diagonal winding path
    const height = (events.length - 1) * STEP_HEIGHT + 150;
    setSvgHeight(height);

    // Start near top-left (8% width)
    const startX = SVG_WIDTH * 0.08;
    // End near bottom-right (92% width)
    const endX = SVG_WIDTH * 0.92;

    let d = `M ${startX} 40 `;
    
    for (let i = 1; i < events.length; i++) {
      const prevY = (i - 1) * STEP_HEIGHT + 40;
      const curY = i * STEP_HEIGHT + 40;
      
      const midY = (prevY + curY) / 2;
      
      // Calculate linear drift across the diagonal
      const prevDriftX = startX + ((endX - startX) * ((i - 1) / (events.length - 1)));
      const curDriftX = startX + ((endX - startX) * (i / (events.length - 1)));
      
      // Add wobble (sine-wave-like)
      const offset = (i % 2 === 0 ? 1 : -1) * 120; 
      
      // Control points for cubic bezier
      d += `C ${prevDriftX + offset} ${midY - 20}, ${curDriftX + offset} ${midY + 20}, ${curDriftX} ${curY} `;
    }

    setPathData(d);
  }, [events]);

  useEffect(() => {
    if (!pathRef.current || !pathData || !events.length) return;

    const totalLength = pathRef.current.getTotalLength();
    const newPoints = [];

    for (let i = 0; i < events.length; i++) {
      const fraction = events.length > 1 ? i / (events.length - 1) : 0;
      const point = pathRef.current.getPointAtLength(fraction * totalLength);
      newPoints.push({ x: point.x, y: point.y });
    }

    setPoints(newPoints);
  }, [pathData, events]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end 75%"]
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "1000px", margin: "0 auto", paddingBottom: "100px" }}>
      
      <div style={{ position: "relative", width: "100%", height: `${svgHeight + 80}px` }}>
        
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight + 80}`} 
          preserveAspectRatio="xMidYMin meet"
          style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
        >
          {/* Base invisible path for length calc */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="transparent" 
            strokeWidth="1"
          />

          {/* 1. Wide translucent riverbed */}
          <path 
            d={pathData} 
            fill="none" 
            stroke="var(--border)" 
            strokeWidth="12"
            strokeLinecap="round"
            style={{ opacity: 0.2 }}
          />

          {/* 2. Gradient water fill tied to scroll */}
          {pathData && (
            <motion.path 
              ref={pathRef}
              d={pathData} 
              fill="none" 
              stroke="url(#river-gradient)" 
              strokeWidth="6"
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
            />
          )}

          {/* 3. Animated dashed "current" shimmer */}
          {pathData && (
             <motion.path 
              d={pathData} 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 12"
              className="river-current"
              style={{ pathLength: scrollYProgress, opacity: 0.6 }}
            />
          )}

          <defs>
            <linearGradient id="river-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary-light)" />
              <stop offset="50%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--primary-dark)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Droplets using offset-path */}
        {pathData && (
          <>
            <div className="river-droplet" style={{ offsetPath: `path('${pathData}')`, animationDelay: "0s" }} />
            <div className="river-droplet" style={{ offsetPath: `path('${pathData}')`, animationDelay: "2s" }} />
            <div className="river-droplet" style={{ offsetPath: `path('${pathData}')`, animationDelay: "4s" }} />
          </>
        )}

        {/* Prevent layout thrashing on first paint by hiding cards until points settle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: points.length > 0 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {points.map((pt, i) => {
            const event = events[i];
            const isLeft = i % 2 !== 0; 
            
            return (
              <div 
                key={event.id || i}
                style={{ 
                  position: "absolute", 
                  left: `calc(${(pt.x / SVG_WIDTH) * 100}% - 8px)`, 
                  top: `calc(${(pt.y / (svgHeight + 80)) * 100}% - 8px)`,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {/* The glowing marker dot on the river */}
                <motion.div 
                  style={{ 
                    width: "16px", 
                    height: "16px", 
                    borderRadius: "50%", 
                    backgroundColor: "#020617", 
                    border: "3px solid #38bdf8",
                    boxShadow: "0 0 15px rgba(56, 189, 248, 0.8), inset 0 0 5px rgba(56, 189, 248, 0.5)",
                    zIndex: 2
                  }} 
                />
                
                {/* Connecting Line */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  [isLeft ? 'right' : 'left']: "16px",
                  width: "32px",
                  height: "2px",
                  backgroundColor: "rgba(56, 189, 248, 0.5)",
                  transform: "translateY(-50%)",
                  zIndex: 1
                }} />

                {/* The Neon Glass Card Container */}
                <div 
                  className={`river-label ${isLeft ? 'left' : 'right'}`}
                  style={{
                    position: "absolute",
                    width: "280px",
                    [isLeft ? 'right' : 'left']: "48px",
                    textAlign: "center",
                    padding: "16px 20px",
                    backgroundColor: "rgba(2, 6, 23, 0.65)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    borderRadius: "8px",
                    boxShadow: "0 0 20px rgba(56, 189, 248, 0.15), inset 0 0 10px rgba(56, 189, 248, 0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <h3 style={{ 
                    fontFamily: "'Cinzel', serif", 
                    fontSize: "1.1rem", 
                    fontWeight: "700", 
                    color: "#e0f2fe", 
                    margin: 0,
                    letterSpacing: "0.05em",
                    textShadow: "0 0 10px rgba(224, 242, 254, 0.5)"
                  }}>
                    {event.email ? event.email.toUpperCase() : event.name?.toUpperCase()}
                  </h3>
                  
                  <div style={{ width: "40px", height: "1px", background: "rgba(56, 189, 248, 0.4)" }} />

                  <p style={{ 
                    fontFamily: "monospace", 
                    fontSize: "0.85rem", 
                    color: "#38bdf8", 
                    margin: 0,
                    letterSpacing: "0.02em"
                  }}>
                    {event.time}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .river-label.left {
            left: 32px !important;
            right: auto !important;
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
}
