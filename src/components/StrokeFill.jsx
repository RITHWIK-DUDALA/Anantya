import React from 'react';
import { motion } from 'framer-motion';

export default function StrokeFill({ 
  text = "JANMASHTAMI", 
  duration = 3, 
  strokeColor = "#FF8C00", 
  fillColor = "#FFFFFF",
  fontSize = "240"
}) {
  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 2400 400" overflow="visible" style={{ width: '100%', height: 'auto', maxHeight: '180px' }}>
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fontSize}
          fontWeight="900"
          strokeWidth="4"
          letterSpacing="24"
          stroke={strokeColor}
          fill="transparent"
          style={{ fontFamily: "'Cinzel', var(--font-display), serif", fontWeight: 700, filter: `drop-shadow(0 0 20px ${strokeColor})` }}
          initial={{ strokeDasharray: 1500, strokeDashoffset: 1500 }}
          animate={{ strokeDashoffset: 0, fill: fillColor }}
          transition={{
            duration,
            ease: "easeInOut",
            fill: {
              delay: duration * 0.67,
              duration: duration * 0.33,
              ease: "easeIn",
            },
          }}
        >
          {text.toUpperCase()}
        </motion.text>
      </svg>
    </div>
  );
}
