import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Altura Market",
    short_name: "Altura Market",
    description: "A market to buy and sell Pokemon items",
    start_url: "/",
    display: "standalone",
    background_color: "#e0f2fe",
    theme_color: "#70b8f0",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "447x447",
        type: "image/png",
      },
    ],
  };
}
