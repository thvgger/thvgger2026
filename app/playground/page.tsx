import type { Metadata } from "next";
import Playground from "@/components/Playground";

export const metadata: Metadata = { title: "Playground", description: "A space for future experiments by Thvgger." };

export default function PlaygroundPage() {
  return <Playground />;
}
