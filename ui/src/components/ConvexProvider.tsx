"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL as string;
if (!url) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required");
}
const client = new ConvexReactClient(url);

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
