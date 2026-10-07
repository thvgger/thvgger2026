import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import RollingText from "@/components/RollingText";

interface UnderlineLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  text?: string;
  external?: boolean;
  arrow?: "↗" | "←" | "↓";
}

export default function UnderlineLink({
  children, text, href, external = false, arrow, className = "", ...props
}: UnderlineLinkProps) {
  const label = text ?? (typeof children === "string" ? children : undefined);
  const content = (
    <>
      {arrow === "←" && <span className="link-arrow" aria-hidden="true">{arrow}</span>}
      {label !== undefined ? <RollingText text={label} /> : children}
      {arrow !== "←" && (arrow || external) && <span className="link-arrow" aria-hidden="true">{arrow ?? "↗"}</span>}
    </>
  );
  const anchorProps = {
    ...props,
    className: `kinetic-link ${className}`.trim(),
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };

  return href.startsWith("/") && !href.startsWith("//")
    ? <Link href={href} {...anchorProps}>{content}</Link>
    : <a href={href} {...anchorProps}>{content}</a>;
}
