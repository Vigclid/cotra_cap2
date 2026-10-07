import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = { title: "Lộ trình học tập · Trạm Sạc Ngữ Văn 🚀" };

export default function RoadmapPage() {
  return <AppShell initialTab="roadmap" />;
}
