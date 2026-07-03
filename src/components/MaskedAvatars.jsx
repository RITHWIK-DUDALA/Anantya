import React, { useState } from "react";
import { motion } from "framer-motion";

export default function MaskedAvatars({
    avatars = [],
    size = 80,
    border = 8,
    column = 45,
    movement = 0.72,
    transition = 0.18,
    ringed = true,
    offset = -3,
    blurOnRest = true,
    className = "",
    onItemClick
}) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const { dynamicSize, maskImage } = React.useMemo(() => {
        const dynamicSize = `clamp(${size - 20}px, ${size}px, ${size + 30}px)`;
        const circle = (border * 2 + size) / 2;
        const radX = circle - column - border;
        const maskImage = `radial-gradient(${circle}px ${circle}px at ${radX}px 50%, transparent ${circle - 0.5}px, white ${circle}px)`;
        return { dynamicSize, maskImage };
    }, [size, border, column]);

    const transitionConfig = React.useMemo(() => ({
        type: "spring",
        stiffness: 260,
        damping: 20,
    }), []);

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: `min(6vw, ${size * 0.5}px)`,
                "--size": dynamicSize,
            }}
            role="group"
        >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ul
                    style={{
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        display: "grid",
                        gridAutoFlow: "column",
                        alignContent: "end",
                        height: column,
                        gridAutoColumns: column,
                        transform: `translateX(${(size - column) * 0.5}px)`,
                    }}
                    role="list"
                >
                    {avatars.map((person, index) => {
                        const isHovered = hoveredIndex === index;
                        const isPrevHovered = hoveredIndex === index - 1;

                        const baseOffset = -size * 1.5;
                        const moveOffset = size * movement;

                        const maskPosition = isPrevHovered
                            ? `0 ${baseOffset - moveOffset}px`
                            : isHovered
                                ? `0 ${baseOffset + moveOffset}px`
                                : `0 ${baseOffset}px`;

                        return (
                            <motion.li
                                key={index}
                                style={{
                                    position: "relative",
                                    display: "grid",
                                    alignContent: "end",
                                    outline: "none",
                                    pointerEvents: "none",
                                    willChange: "transform",
                                    width: dynamicSize,
                                    aspectRatio: "1/3",
                                    transform: `translate(${(size - column) * -0.5}px, ${(size - column) * 0.5}px)`,
                                    zIndex: avatars.length - index,
                                }}
                                role="listitem"
                                tabIndex={0}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onFocus={() => setHoveredIndex(index)}
                                onBlur={() => setHoveredIndex(null)}
                                onTouchStart={() => setHoveredIndex(index)}
                                onClick={() => onItemClick && onItemClick(person.originalData)}
                            >
                                {ringed && (
                                    <div
                                        aria-hidden="true"
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            textAlign: "center",
                                            textTransform: "uppercase",
                                            fontFamily: "monospace",
                                            fontWeight: "bold",
                                            pointerEvents: "none",
                                            width: size,
                                            height: size,
                                            borderRadius: "50%",
                                            bottom: 0,
                                            transform: `translate(-50%, ${isHovered ? -movement * 100 : 0}%)`,
                                            transition: `transform ${transition}s ease-out`,
                                            color: 'black',
                                            fontSize: '14px',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        {person.name.split("").map((char, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    position: "absolute",
                                                    willChange: "transform",
                                                    offsetPath: "border-box",
                                                    offsetDistance: `${(offset + i) * 1.2}ch`,
                                                    offsetAnchor: "50% 130%",
                                                    transform: isHovered ? "translate(0, 0)" : "translate(0, 100%)",
                                                    filter: isHovered ? "blur(0px)" : blurOnRest ? "blur(4px)" : "blur(0px)",
                                                    opacity: isHovered ? 1 : 0,
                                                    transition: `transform ${transition}s ease-out, opacity ${transition}s ease-out, filter ${transition}s ease-out`,
                                                }}
                                            >
                                                {char}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "grid", alignContent: "end" }}>
                                    <motion.div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            borderRadius: "50%",
                                            pointerEvents: "none",
                                            zIndex: -1,
                                        }}
                                        animate={{
                                            y: isHovered ? -movement * 100 + "%" : "0%",
                                            scale: isHovered ? 1.05 : 1,
                                            boxShadow: isHovered ? "0 0 35px 5px rgba(255, 140, 0, 0.7)" : "0 4px 10px rgba(0,0,0,0.2)",
                                        }}
                                        transition={transitionConfig}
                                    />
                                    
                                    <motion.span
                                        role="img"
                                        aria-label={person.name}
                                        style={{
                                            display: "inline-block",
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            borderRadius: "50%",
                                            position: "relative",
                                            overflow: "hidden",
                                            pointerEvents: "auto",
                                            border: "3px solid var(--surface-alt)",
                                            willChange: "transform",
                                            cursor: "pointer",
                                            maskImage: index === 0 ? "none" : maskImage,
                                            WebkitMaskImage: index === 0 ? "none" : maskImage,
                                            maskSize: "100% 400%",
                                            WebkitMaskSize: "100% 400%",
                                            maskRepeat: "no-repeat",
                                        }}
                                        animate={{
                                            maskPosition: index === 0 ? "0 0" : maskPosition,
                                            y: isHovered ? -movement * 100 + "%" : "0%",
                                            scale: isHovered ? 1.05 : 1,
                                            opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.7 : 1,
                                        }}
                                        transition={transitionConfig}
                                    >
                                        {person.avatar ? (
                                            <img
                                                src={person.avatar}
                                                alt={person.name}
                                                style={{
                                                    position: "absolute",
                                                    top: 0, right: 0, bottom: 0, left: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    objectPosition: person.originalData?.objectPosition || "center",
                                                    backgroundColor: "var(--bg-alt)"
                                                }}
                                            />
                                        ) : (
                                            <div style={{ position: 'absolute', inset: 0, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                                {person.name.slice(0,2).toUpperCase()}
                                            </div>
                                        )}
                                    </motion.span>
                                </div>

                                {/* Hover/Tap Hit Area */}
                                <div style={{ position: "absolute", bottom: 0, width: "100%", aspectRatio: "1/1", pointerEvents: "auto", cursor: "pointer" }} />
                            </motion.li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
