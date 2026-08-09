import { createFileRoute } from "@tanstack/react-router";
import { AdminNotFound } from "@/components/AdminFallback";

export const Route = createFileRoute("/admin/$")({
  head: () => ({
    meta: [
      { title: "Not found — Dawood Mart Admin" },
      { name: "description", content: "The requested Dawood Mart admin page could not be found." },
      { property: "og:title", content: "Not found — Dawood Mart Admin" },
      {
        property: "og:description",
        content: "The requested Dawood Mart admin page could not be found.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNotFound,
});
