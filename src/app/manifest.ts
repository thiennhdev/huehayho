import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Học Cùng Nhau",
    short_name: "Học Cùng Nhau",
    description: "Tiếng Anh & Tiếng Trung cho hai người",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4fb",
    theme_color: "#7c3aed",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
