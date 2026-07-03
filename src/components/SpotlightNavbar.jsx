import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function SpotlightNavbar({
    items = [
        { label: "Home", href: "/" },
        { label: "Games", href: "/register" }
    ],
    className,
    onItemClick,
}) {
    const navRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine default active index based on current path
    const initialIndex = items.findIndex(item => item.href === location.pathname);
    const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
    const [hoverX, setHoverX] = useState(null);

    // Refs for the "light" positions so we can animate them imperatively
    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            // Direct update for immediate feedback (no spring for the mouse itself, feels snappier)
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            // When mouse leaves, spring the spotlight back to the active item
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    }
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    // Handle the "Ambience" (Active Item) Movement
    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item, index) => {
        setActiveIndex(index);
        if (onItemClick) {
            onItemClick(item, index);
        } else {
            navigate(item.href);
        }
    };

    return (
        <div className={cn("spotlight-container", className)}>
            <nav
                ref={navRef}
                className="spotlight-nav glass-border"
            >
                {/* Content */}
                <ul className="spotlight-ul">
                    {items.map((item, idx) => (
                        <li key={idx} className="spotlight-li">
                            <a
                                href={item.href}
                                data-index={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(item, idx);
                                }}
                                className={cn(
                                    "spotlight-link",
                                    activeIndex === idx ? "spotlight-active" : "spotlight-inactive"
                                )}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* 1. The Moving Spotlight (Follows Mouse) */}
                <div
                    className="spotlight-hover-layer"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color, rgba(255,255,255,0.15)) 0%, transparent 50%)`
                    }}
                />

                {/* 2. The Active State Ambience (Stays on Active) */}
                <div
                    className="spotlight-active-layer"
                    style={{
                        background: `radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color, rgba(255,255,255,1)) 0%, transparent 100%)`
                    }}
                />
            </nav>
        </div>
    );
}
