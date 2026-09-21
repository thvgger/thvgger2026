import React from "react";

export interface UnderlineLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  text?: string;
  href: string;
  external?: boolean;
  variant?: "light" | "dark";
  className?: string;
  underlineClassName?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function UnderlineLink({
  children,
  text,
  href,
  external = false,
  variant = "light",
  className = "",
  underlineClassName = "",
  onClick,
  ...props
}: UnderlineLinkProps) {
  const contentString =
    text || (typeof children === "string" ? children : undefined);

  const colorClasses = variant === "dark" ? "text-white" : "text-black";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={`group relative inline-flex items-center gap-1 py-1 cursor-pointer focus:outline-none select-none ${colorClasses} ${className}`.trim()}
      {...props}
    >
      {contentString ? (
        <span className="relative inline-block overflow-hidden leading-tight py-0.5">
          {contentString.split("").map((char, i) => (
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
          ))}
        </span>
      ) : (
        children
      )}

      {external && (
        <span
          aria-hidden="true"
          className="inline-block text-[10px] opacity-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      )}

      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-current scale-x-0 origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 ${underlineClassName}`.trim()}
      />
    </a>
  );
}
