import { createFileRoute } from "@tanstack/react-router";
import { AdminNotFound } from "@/components/AdminFallback";

export const Route = createFileRoute("/admin/$")({
  head: () => ({
    meta: [
      { title: "Not found — Maison Terra Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNotFound,
});
