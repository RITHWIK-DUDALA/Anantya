"use client"

import React, { useEffect, useState, useMemo, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"

const defaultWords = ["LOADING", "COMPUTING", "SEARCHING", "RETRIEVING", "ASSEMBLING"]

// Memoized Letter component for performance
const Letter = memo(function Letter({
    char,
    letterDuration
}) {
    return (
        <motion.span
            style={{ transformStyle: "preserve-3d", display: "inline-block" }}
            variants={{
                initial: {
                    rotateX: 90,
                    y: 20,
                    opacity: 0,
                    filter: "blur(8px)",
                },
                animate: {
                    rotateX: 0,
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    transition: {
                        duration: letterDuration,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    },
                },
                exit: {
                    rotateX: -90,
                    y: -20,
                    opacity: 0,
                    filter: "blur(8px)",
                    transition: {
                        duration: letterDuration * 0.67,
                        ease: "easeIn",
                    },
                },
            }}
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    )
})

// Memoized Word component for performance
const Word = memo(function Word({
    text,
    staggerDelay,
    exitStaggerDelay,
    letterDuration,
    textClassName,
    style
}) {
    const letters = useMemo(() => text.split(""), [text])

    return (
        <motion.div
            className={["flip-fade-word", textClassName].filter(Boolean).join(" ")}
            style={{
                display: 'flex',
                gap: '0.05em',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#fff',
                textShadow: '0 4px 24px rgba(0,0,0,0.5)',
                ...style
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
                initial: { opacity: 1 },
                animate: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
                exit: {
                    opacity: 1,
                    transition: {
                        staggerChildren: exitStaggerDelay,
                    },
                },
            }}
        >
            {letters.map((char, i) => (
                <Letter
                    key={`${char}-${i}`}
                    char={char}
                    letterDuration={letterDuration}
                />
            ))}
        </motion.div>
    )
})

export function FlipFadeText({
    words = defaultWords,
    interval = 2500,
    className,
    textClassName,
    style,
    textStyle,
    letterDuration = 0.6,
    staggerDelay = 0.1,
    exitStaggerDelay = 0.05,
    subtext,
}) {
    const [index, setIndex] = useState(0)

    // Memoize the interval callback
    const updateIndex = useCallback(() => {
        setIndex((prev) => (prev + 1) % words.length)
    }, [words.length])

    useEffect(() => {
        const timer = setInterval(updateIndex, interval)
        return () => clearInterval(timer)
    }, [updateIndex, interval])

    // Memoize the current word
    const currentWord = useMemo(() => words[index], [words, index])

    return (
        <div 
            className={["flip-fade-container", className].filter(Boolean).join(" ")}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                ...style
            }}
        >
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", perspective: "1000px" }}>
                <AnimatePresence mode="wait">
                    <Word
                        key={currentWord}
                        text={currentWord}
                        staggerDelay={staggerDelay}
                        exitStaggerDelay={exitStaggerDelay}
                        letterDuration={letterDuration}
                        textClassName={textClassName}
                        style={textStyle}
                    />
                </AnimatePresence>
            </div>
            
            {subtext && (
                <p style={{
                    fontSize: '1.1rem',
                    color: '#e5e7eb',
                    maxWidth: '600px',
                    textAlign: 'center',
                    margin: '20px 0 0 0',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    animation: 'morph-fade-up 1s ease-out forwards'
                }}>
                    {subtext}
                </p>
            )}
        </div>
    )
}

export default FlipFadeText
