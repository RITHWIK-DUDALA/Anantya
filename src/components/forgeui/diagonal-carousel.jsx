"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// SVG replacements for lucide-react ChevronLeft/ChevronRight
const ChevronLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const DEFAULT_TRANSITION = {
  type: "spring",
  bounce: 0.16,
  duration: 0.85,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function DiagonalCarousel({
  items,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  onItemClick,
  loop = false,
  slideSize = 260,
  rotationStep = 30,
  verticalStep = 80,
  inactiveScale = 0.6,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  viewportClassName,
  slideClassName,
  imageClassName,
  labelClassName,
  controlsClassName,
  className,
  onKeyDown,
  tabIndex,
  ...props
}) {
  const { t } = useTranslation();
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex)
  );
  const currentIndex = clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);
  const safeSlideSize = Math.max(120, slideSize);
  const safeInactiveScale = clamp(inactiveScale, 0.35, 1);

  const selectSlide = React.useCallback(
    (nextIndex) => {
      if (!items.length) {
        return;
      }

      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }

      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange]
  );

  const handleKeyDown = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
  };

  const wheelTimeout = React.useRef(null);
  const handleWheel = (event) => {
    // Check if scroll is predominantly horizontal to avoid interfering with vertical page scrolling
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 15) {
      if (wheelTimeout.current) return;
      
      if (event.deltaX > 0) {
        if (!isNextDisabled || loop) selectSlide(currentIndex + 1);
      } else {
        if (!isPreviousDisabled || loop) selectSlide(currentIndex - 1);
      }
      
      // Debounce the wheel event
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 350);
    }
  };

  if (!items.length) {
    return null;
  }

  const isPreviousDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === maxIndex;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Diagonal image carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      className={cn("relative isolate overflow-hidden", className)}
      style={{ height: '600px', width: '100%', position: 'relative' }}
      {...props}
    >
      <div className={cn("absolute inset-0 overflow-hidden", viewportClassName)} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <motion.div
          className="absolute flex w-fit"
          style={{ position: 'absolute', left: '50%', top: '15%', display: 'flex', cursor: 'grab' }}
          animate={{ x: -(currentIndex * safeSlideSize + safeSlideSize / 2) }}
          transition={transition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          whileTap={{ cursor: 'grabbing' }}
          onDragEnd={(e, { offset }) => {
            if (offset.x < -40 && (!isNextDisabled || loop)) {
              selectSlide(currentIndex + 1);
            } else if (offset.x > 40 && (!isPreviousDisabled || loop)) {
              selectSlide(currentIndex - 1);
            }
          }}
        >
          {items.map((item, index) => {
            const isActive = currentIndex === index;
            const distance = index - currentIndex;

            return (
              <motion.div
                key={`${item.src}-${index}`}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-2 will-change-transform",
                  slideClassName
                )}
                style={{ width: safeSlideSize, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}
                animate={{
                  rotate: distance * rotationStep,
                  scale: isActive ? 1 : safeInactiveScale,
                  y: distance * verticalStep,
                  opacity: Math.max(0, 1 - Math.abs(distance) * 0.35),
                  pointerEvents: Math.abs(distance) > 2 ? 'none' : 'auto'
                }}
                transition={transition}
              >
                <motion.div
                  className={cn("whitespace-nowrap text-sm", labelClassName)}
                  style={{ whiteSpace: 'nowrap', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text)', textAlign: 'center' }}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t(`games.${item.id}.title`)}
                  {isActive && (
                    <div style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--primary-dark)', marginTop: '4px' }}>
                      {t('gamePage.clickToView')}
                    </div>
                  )}
                </motion.div>

                <button
                  type="button"
                  aria-label={`Show ${item.title}`}
                  aria-current={isActive ? "true" : undefined}
                  className="cursor-pointer"
                  style={{ display: 'block', height: safeSlideSize, width: '100%', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
                  onClick={() => {
                    if (isActive && onItemClick) {
                      onItemClick(item);
                    } else {
                      selectSlide(index);
                    }
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.alt ?? item.title}
                    draggable={false}
                    className={cn(
                      "h-full w-full select-none rounded-2xl shadow-xl",
                      imageClassName
                    )}
                    style={{ 
                      height: '100%', 
                      width: '100%', 
                      userSelect: 'none', 
                      borderRadius: '1rem', 
                      objectFit: 'contain', 
                      backgroundColor: '#000', 
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' 
                    }}
                  />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {showControls && (
        <div
          className={cn(
            "absolute inset-x-4 bottom-5 z-10 mx-auto flex w-fit items-center justify-center gap-3 rounded-full px-2 shadow-sm backdrop-blur-sm",
            controlsClassName
          )}
          style={{
             position: 'absolute', bottom: '1.25rem', left: '0', right: '0', zIndex: 10, margin: '0 auto', display: 'flex', width: 'fit-content', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '9999px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.7)', padding: '0.5rem', color: 'var(--text)'
          }}
        >
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className="inline-flex items-center justify-center rounded-full transition-colors"
            style={{ width: '2.25rem', height: '2.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', cursor: isPreviousDisabled ? 'not-allowed' : 'pointer', opacity: isPreviousDisabled ? 0.35 : 1, border: 'none', background: 'transparent', color: 'var(--text)' }}
            onClick={() => selectSlide(currentIndex - 1)}
          >
            <ChevronLeft className="size-5" style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          {showDots && (
            <div className="flex items-center justify-center gap-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className="rounded-full bg-current"
                  style={{
                    height: '0.5rem', borderRadius: '9999px', backgroundColor: 'currentColor', transition: 'width 0.3s, opacity 0.3s', cursor: 'pointer', border: 'none', padding: 0,
                    width: currentIndex === index ? '1.75rem' : '0.5rem',
                    opacity: currentIndex === index ? 1 : 0.3
                  }}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className="inline-flex items-center justify-center rounded-full transition-colors"
            style={{ width: '2.25rem', height: '2.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', cursor: isNextDisabled ? 'not-allowed' : 'pointer', opacity: isNextDisabled ? 0.35 : 1, border: 'none', background: 'transparent', color: 'var(--text)' }}
            onClick={() => selectSlide(currentIndex + 1)}
          >
            <ChevronRight className="size-5" style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DiagonalCarousel;
