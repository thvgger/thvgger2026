import React from "react";

export interface ButtonProps {
  /** Text content for the button (supports kinetic character-roll animation) */
  children?: React.ReactNode;
  /** Optional explicit text string */
  text?: string;
  /** If provided, renders as an anchor <a> link. Otherwise renders as a <button> */
  href?: string;
  /** Target theme: "dark" (white border/text on dark bg) or "light" (black border/text on light bg) */
  variant?: "dark" | "light";
  /** Size options */
  size?: "sm" | "md" | "lg";
  /** Additional custom classNames */
  className?: string;
  /** Standard click handler */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** HTML button type when rendered as <button> */
  type?: "button" | "submit" | "reset";
  /** Open link in new tab if true */
  external?: boolean;
  /** Disable button state */
  disabled?: boolean;
}

export default function Button({
  children,
  text,
  href,
  variant = "dark",
  size = "md",
  className = "",
  onClick,
  type = "button",
  external = false,
  disabled = false,
  ...props
}: ButtonProps) {
  const contentString =
    text || (typeof children === "string" ? children : undefined);

  // Variant color mappings
  const variantClasses =
    variant === "light"
      ? "border-black/70 text-black hover:text-white"
      : "border-white/70 text-white hover:text-black";

  const bgFillColor = variant === "light" ? "bg-black" : "bg-white";

  // Size mappings - larger button dimensions with micro typography
  const sizeClasses = {
    sm: "px-6 sm:px-7 py-3 text-[8.5px] tracking-[0.18em]",
    md: "px-9 sm:px-12 py-4 sm:py-[18px] text-[9px] sm:text-[9.5px] tracking-[0.22em]",
    lg: "px-12 sm:px-16 py-5 sm:py-6 text-[10px] sm:text-[10.5px] tracking-[0.22em]",
  }[size];

  const baseClasses = `
    group relative inline-flex items-center justify-center
    border-[0.5px] font-semibold uppercase select-none cursor-pointer
    overflow-hidden focus:outline-none leading-none
    transition-colors duration-500 ease-[cubic-bezier(0.08,0.95,0.18,1)]
    ${variantClasses}
    ${sizeClasses}
    ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  const innerContent = (
    <>
      {/* Bottom-up wiping background fill with pronounced, dramatic ease-out */}
      <span
        aria-hidden="true"
        className={`absolute -inset-x-2 -bottom-2 -top-2 ${bgFillColor} origin-bottom scale-y-0 -skew-y-6 transition-all duration-700 ease-[cubic-bezier(0.08,0.95,0.18,1)] group-hover:scale-y-100 group-hover:skew-y-0 pointer-events-none`}
      />

      {/* Kinetic character-rolling text (if string) or standard children */}
      <span className="relative z-10 block overflow-hidden leading-none py-0.5">
        {contentString ? (
          contentString.split("").map((char, i) => (
            <span
              key={i}
              style={
                {
                  "--char-delay": `${i * 18}ms`,
                } as React.CSSProperties
              }
              className="inline-block transition-none group-hover:transition-transform group-hover:duration-500 group-hover:ease-[cubic-bezier(0.625,0.05,0,1)] group-hover:[transition-delay:var(--char-delay)] group-hover:-translate-y-[1.35em] [text-shadow:0_1.35em_currentColor]"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))
        ) : (
          children
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...props}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      disabled={disabled}
      {...props}
    >
      {innerContent}
    </button>
  );
}
