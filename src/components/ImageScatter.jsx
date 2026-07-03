import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ImageScatter({
  data,
  cardWidth = 250,
  cardHeight = 300,
  animationDuration = 1.2,
  className,
  ...props
}) {
  const [currentSection, setCurrentSection] = useState(0);

  // Use a hook to get window dimensions for responsive radius
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1000,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-cycle through the sections
  useEffect(() => {
    if (!data || data.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % data.length);
    }, 7500); // Increased to 7.5s so photos stay on screen longer
    return () => clearInterval(intervalId);
  }, [data]);

  const activeData = data[currentSection];
  const images = activeData?.images || [];

  // Pre-calculate positions for the current section deterministically
  const cardsLayout = useMemo(() => {
    // Determine a range for the scattered circle around the center text
    const minDim = Math.min(windowSize.width, windowSize.height);
    // Adjusted rangeMax so photos push out past the text, but not totally off-screen
    const rangeMax = minDim * 0.6;

    return images.map((src, index) => {
      // Deterministic pseudo-random generation based on index and section
      const pr1 = Math.abs(Math.sin(index + currentSection * 10 + 1)); 
      const pr2 = Math.abs(Math.cos(index + currentSection * 10 + 2));
      const pr3 = Math.abs(Math.sin(index + currentSection * 10 + 3));

      // Calculate the circular distribution
      const baseAngle = (index / images.length) * Math.PI * 2;
      const angleOffset = (pr1 - 0.5) * 1.5; // Allow more random angle overlap
      const angle = baseAngle + angleOffset;
      // Enforce a minimum radius so they don't cover the central text!
      const radius = rangeMax * 0.55 + (pr2 * 0.35 * rangeMax);

      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * radius;
      const targetRotation = (pr1 * 60) - 30;

      // Determine a starting edge off-screen for entry
      const edges = [
        { x: -windowSize.width - 200, y: targetY }, // left
        { x: windowSize.width + 200, y: targetY },  // right
        { x: targetX, y: -windowSize.height - 200 },// top
        { x: targetX, y: windowSize.height + 200 }, // bottom
      ];
      // Pick an edge based on a deterministic pseudo-random value
      const startEdge = edges[Math.floor(pr3 * 4)];
      
      // Calculate an exit edge (ideally opposite to the start edge)
      const exitEdge = {
        x: startEdge.x * -1,
        y: startEdge.y * -1
      };

      return {
        id: `${currentSection}-${index}`, // Unique ID tied to section guarantees unmount/mount
        src,
        targetX,
        targetY,
        targetRotation,
        startX: startEdge.x,
        startY: startEdge.y,
        exitX: exitEdge.x,
        exitY: exitEdge.y,
        startRotation: (pr2 * 180) - 90,
      };
    });
  }, [images, currentSection, windowSize]);

  if (!data || data.length === 0) return null;

  return (
    <div 
      className={`scatter-container ${className || ""}`}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      {...props}
    >
      {/* Title transition */}
      <AnimatePresence mode="wait">
        <motion.h1
          key={`heading-${currentSection}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="scatter-heading"
          style={{ position: 'absolute', zIndex: 10 }}
        >
          {activeData?.heading}
        </motion.h1>
      </AnimatePresence>

      {/* Cards transition */}
      <AnimatePresence>
        {cardsLayout.map((card, i) => (
          <motion.div
            key={card.id}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -cardWidth / 2,
              marginTop: -cardHeight / 2,
              width: cardWidth,
              height: cardHeight,
              zIndex: 5,
            }}
            // 1. Initial off-screen position
            initial={{
              x: card.startX,
              y: card.startY,
              rotate: card.startRotation,
              opacity: 1
            }}
            // 2. Animate to calculated scatter position
            animate={{
              x: card.targetX,
              y: card.targetY,
              rotate: card.targetRotation,
              transition: {
                type: 'spring',
                stiffness: 120,
                damping: 20,
                delay: i * 0.1, // Staggered entry
              }
            }}
            // 3. Animate out to off-screen when section changes
            exit={{
              x: card.exitX,
              y: card.exitY,
              rotate: card.startRotation * -1,
              transition: { 
                duration: animationDuration, 
                ease: "easeInOut" 
              }
            }}
          >
            {/* Inner div specifically for the infinite floating animation */}
            <motion.div
              className="scatter-card"
              style={{
                position: 'relative', // Overrides 'absolute' in index.css
                width: '100%',
                height: '100%',
                margin: 0,
                padding: 0
              }}
              animate={{
                y: [0, 15, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 2.5 + (Math.abs(Math.sin(i)) * 1.5),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img 
                src={card.src} 
                alt="scatter" 
                className="scatter-img" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
