import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaf-N-Go",
  description: "Packing tool designed to help outdoor adventurers prepare for their trips with efficiency, sustainability, and customization",
};

export default function Head() {
  return (
    <>
      <title>{String(metadata.title) || "Leaf-N-Go"}</title>
      <meta name="description" content={String(metadata.description) || "Packing tool designed to help outdoor adventurers prepare for their trips with efficiency, sustainability, and customization"} />
    </>
  );
}
