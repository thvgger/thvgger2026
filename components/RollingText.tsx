import type { CSSProperties } from "react";

/** A single accessible label with a staggered, purely visual letter roll. */
export default function RollingText({ text }: { text: string }) {
  let index = 0;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="rolling-text" aria-hidden="true">
        {Array.from(text).map((character, position) => {
          if (/\s/.test(character)) return character;
          const style = { "--char-index": index++ } as CSSProperties;
          return <span key={position} className="rolling-char" style={style}>{character}</span>;
        })}
      </span>
    </>
  );
}
