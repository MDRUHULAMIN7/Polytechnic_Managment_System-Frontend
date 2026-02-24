import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "http://localhost:3000";

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${baseUrl}/login`,
      changeFrequency: "weekly",
      priority: 0.9
    }
  ];
}
