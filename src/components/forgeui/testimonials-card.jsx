"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG replacements for lucide-react ArrowLeft/ArrowRight
const ArrowLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

// Simple utility to join classNames, mimicking `cn` from tailwind-merge
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function TestimonialsCard({
    items,
    className,
    width = 400,
    showNavigation = true,
    showCounter = true,
    autoPlay = false,
    autoPlayInterval = 3000,
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const activeItem = items[activeIndex];

    // Auto-play effect
    React.useEffect(() => {
        if (!autoPlay || items.length <= 1) return;

        const interval = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, items.length]);

    const handleNext = () => {
        if (activeIndex < items.length - 1) {
            setDirection(1);
            setActiveIndex(activeIndex + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setDirection(-1);
            setActiveIndex(activeIndex - 1);
        }
    };

    // Pre-calculate rotations for visual variety
    const rotations = useMemo(() => [4, -2, -9, 7], []);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className={cn("testimonials-container", className)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div
                className="testimonials-grid"
                style={{ 
                    position: 'relative', 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem 1rem',
                    width: '100%',
                    perspective: "1400px", 
                    maxWidth: `${width * 2}px` // Double width to fit text side-by-side
                }}
            >
                {/* Counter */}
                {showCounter && (
                    <div style={{ gridColumn: '2', gridRow: '1', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.875rem', color: '#9ca3af' }}>
                        {activeIndex + 1} / {items.length}
                    </div>
                )}

                {/* Image Card Stack */}
                <div style={{ gridColumn: '1', gridRow: '1 / span 3', position: 'relative', width: '100%', aspectRatio: '3/4', maxWidth: `${width}px` }}>
                    <AnimatePresence custom={direction}>
                        {items.map((item, index) => {
                            const isActive = index === activeIndex;
                            const offset = index - activeIndex;

                            return (
                                <motion.div
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        overflow: 'hidden',
                                        border: '6px solid var(--border, #333)',
                                        backgroundColor: 'var(--surface, #111)',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    initial={{
                                        x: offset * 15,
                                        y: Math.abs(offset) * 6,
                                        z: -150 * Math.abs(offset),
                                        scale: 0.85 - Math.abs(offset) * 0.04,
                                        rotateZ: rotations[index % 4],
                                        opacity: isActive ? 1 : 0.5,
                                        zIndex: 10 - Math.abs(offset),
                                    }}
                                    animate={
                                        isActive
                                            ? {
                                                x: [offset * 15, direction === 1 ? -200 : 200, 0],
                                                y: [Math.abs(offset) * 6, 0, 0],
                                                z: [-200, 150, 250],
                                                scale: [0.85, 1.05, 1],
                                                rotateZ: [rotations[index % 4], -5, 0],
                                                opacity: 1,
                                                zIndex: 100,
                                            }
                                            : {
                                                x: offset * 15,
                                                y: Math.abs(offset) * 6,
                                                z: -150 * Math.abs(offset),
                                                rotateZ: rotations[index % 4],
                                                scale: 0.85 - Math.abs(offset) * 0.04,
                                                opacity: 0.55,
                                                zIndex: 10 - Math.abs(offset),
                                            }
                                    }
                                    exit={{
                                        x: direction === 1 ? -250 : 250,
                                        z: -260,
                                        scale: 0.75,
                                        rotateZ: direction === 1 ? -10 : 10,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.75,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                                        draggable={false}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Text Area */}
                {(activeItem.title || activeItem.description) && (
                <div style={{ gridColumn: '2', gridRow: '1 / span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem.id}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -25 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary, #fff)', margin: '0 0 0.5rem 0' }}>
                                {activeItem.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #aaa)', margin: 0, lineHeight: 1.5 }}>
                                {activeItem.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
                )}

                {/* Navigation Controls */}
                {showNavigation && items.length > 1 && (
                    <div style={{ gridColumn: '2', gridRow: '3', display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                            disabled={activeIndex === 0}
                            onClick={handlePrev}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', borderRadius: '9999px',
                                border: '1px solid var(--border, #333)',
                                backgroundColor: 'var(--surface, #111)',
                                cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
                                opacity: activeIndex === 0 ? 0.5 : 1,
                                transition: 'all 0.2s',
                                color: '#fff'
                            }}
                            aria-label="Previous card"
                        >
                            <ArrowLeft className="w-4 h-4 text-neutral-300" />
                        </button>
                        <button
                            disabled={activeIndex === items.length - 1}
                            onClick={handleNext}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', borderRadius: '9999px',
                                border: '1px solid var(--border, #333)',
                                backgroundColor: 'var(--surface, #111)',
                                cursor: activeIndex === items.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: activeIndex === items.length - 1 ? 0.5 : 1,
                                transition: 'all 0.2s',
                                color: '#fff'
                            }}
                            aria-label="Next card"
                        >
                            <ArrowRight className="w-4 h-4 text-neutral-300" />
                        </button>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 768px) {
                    .testimonials-grid {
                        grid-template-columns: 1fr !important;
                        grid-template-rows: auto auto auto !important;
                        justify-items: center;
                    }
                    .testimonials-grid > div:nth-child(1) { grid-column: 1 !important; grid-row: 1 !important; text-align: center !important; }
                    .testimonials-grid > div:nth-child(2) { grid-column: 1 !important; grid-row: 2 !important; max-width: 300px !important; }
                    .testimonials-grid > div:nth-child(3) { grid-column: 1 !important; grid-row: 3 !important; text-align: center !important; margin-top: 1rem; }
                    .testimonials-grid > div:nth-child(4) { grid-column: 1 !important; grid-row: 4 !important; justify-content: center !important; }
                }
            `}} />
        </div>
    );
}

export default TestimonialsCard;
