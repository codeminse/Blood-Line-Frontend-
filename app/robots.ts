import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/profile", "/api/"],
      },
    ],
    sitemap: "https://fenibloodline.com/sitemap.xml",
  };
}
