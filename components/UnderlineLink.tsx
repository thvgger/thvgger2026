import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import RollingText from "@/components/RollingText";
import ArrowIcon, { type ArrowDirection } from "@/components/ArrowIcon";

interface UnderlineLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  text?: string;
  external?: boolean;
  arrow?: ArrowDirection;
  onNavigate?: LinkProps["onNavigate"];
}

export default function UnderlineLink({
  children, text, href, external = false, arrow, className = "", onNavigate, ...props
}: UnderlineLinkProps) {
  const label = text ?? (typeof children === "string" ? children : undefined);
  const content = (
    <>
      {arrow === "left" && <span className="link-arrow"><ArrowIcon direction="left" /></span>}
      {label !== undefined ? <RollingText text={label} /> : children}
      {arrow !== "left" && (arrow || external) && <span className="link-arrow"><ArrowIcon direction={arrow ?? "up-right"} /></span>}
    </>
  );
  const anchorProps = {
    ...props,
    className: `kinetic-link ${className}`.trim(),
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };

  return !external && href.startsWith("/") && !href.startsWith("//")
    ? <Link href={href} onNavigate={onNavigate} {...anchorProps}>{content}</Link>
    : <a href={href} {...anchorProps}>{content}</a>;
}
