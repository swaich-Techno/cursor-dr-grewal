import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dr. Grewal — Grewal Homeo Remedies",
    short_name: "Dr. Grewal",
    description: "Demonstration website for Grewal Homeo Remedies, Mohali.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f5c32",
    lang: "en",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
