export type ArrowDirection = "up-right" | "left" | "right" | "down";

const paths: Record<ArrowDirection, string> = {
  "up-right": "M5 19 19 5M5 5h14v14",
  left: "M20 12H4m7-7-7 7 7 7",
  right: "M4 12h16m-7-7 7 7-7 7",
  down: "M12 4v16m-7-7 7 7 7-7",
};

export default function ArrowIcon({ direction = "up-right", className = "" }: {
  direction?: ArrowDirection;
  className?: string;
}) {
  return (
    <svg
      className={`arrow-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[direction]} />
    </svg>
  );
}
