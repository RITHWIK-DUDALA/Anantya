import React, { useMemo } from "react";

export function FlipText({
  className = "",
  children,
  duration = 2.2,
  delay = 0,
  loop = true,
  separator = " ",
  together = false,
}) {
  const words = useMemo(() => children.split(separator), [children, separator]);
  const totalChars = children.length;

  const getCharIndex = (wordIndex, charIndex) => {
    let index = 0;
    for (let i = 0; i < wordIndex; i++) {
      index += words[i].length + (separator === " " ? 1 : separator.length);
    }
    return index + charIndex;
  };

  return (
    <div
      className={["flip-text-wrapper", className].filter(Boolean).join(" ")}
      style={{ perspective: "1000px", display: "inline-block", lineHeight: 1 }}
    >
      {words.map((word, wordIndex) => {
        const chars = word.split("");

        return (
          <span
            key={wordIndex}
            className="word"
            style={{ display: "inline-block", whiteSpace: "nowrap", transformStyle: "preserve-3d" }}
          >
            {chars.map((char, charIndex) => {
              const currentGlobalIndex = getCharIndex(wordIndex, charIndex);

              let calculatedDelay = delay;
              if (!together) {
                const normalizedIndex = currentGlobalIndex / totalChars;
                const sineValue = Math.sin(normalizedIndex * (Math.PI / 2));
                calculatedDelay = sineValue * (duration * 0.25) + delay;
              }

              return (
                <span
                  key={charIndex}
                  className="flip-char"
                  data-char={char}
                  style={{
                    "--flip-duration": `${duration}s`,
                    "--flip-delay": `${calculatedDelay}s`,
                    "--flip-iteration": loop ? "infinite" : "1",
                    display: "inline-block",
                    position: "relative",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {char}
                </span>
              );
            })}
            {separator === " " && wordIndex < words.length - 1 && (
              <span className="whitespace" style={{ display: "inline-block" }}>&nbsp;</span>
            )}
            {separator !== " " && wordIndex < words.length - 1 && (
              <span className="separator" style={{ display: "inline-block" }}>{separator}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default FlipText;
