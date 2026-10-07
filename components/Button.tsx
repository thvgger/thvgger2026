import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import RollingText from "@/components/RollingText";

interface ButtonProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  text?: string;
  href?: string;
  variant?: "light" | "dark";
  type?: "button" | "submit" | "reset";
  external?: boolean;
  disabled?: boolean;
}

export default function Button({
  children, text, href, variant = "light", className = "", type = "button",
  external = false, disabled = false, ...props
}: ButtonProps) {
  const label = text ?? (typeof children === "string" ? children : undefined);
  const content = label !== undefined ? <RollingText text={label} /> : children;
  const classes = `outline-button outline-button--${variant} ${className}`.trim();

  if (href && !disabled) {
    const anchorProps = {
      ...props, className: classes,
      ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    };
    return href.startsWith("/") && !href.startsWith("//")
      ? <Link href={href} {...anchorProps}>{content}</Link>
      : <a href={href} {...anchorProps}>{content}</a>;
  }

  return <button type={type} className={classes} disabled={disabled} {...props}>{content}</button>;
}
