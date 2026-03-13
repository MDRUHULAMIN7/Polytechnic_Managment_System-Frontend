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
    },
    {
      url: `${baseUrl}/events`,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${baseUrl}/alumni`,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${baseUrl}/academic-calendar`,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${baseUrl}/academic-instructors`,
      changeFrequency: "weekly",
      priority: 0.85
    },
    {
      url: `${baseUrl}/notices`,
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}
