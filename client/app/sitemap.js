export const dynamic = 'force-dynamic';

/**
 * @returns {Promise<import("next").MetadataRoute.Sitemap>}
 */
export default async function generateSitemap() {
  const baseUrl = "https://vokely.io";
  const currentDate = new Date().toISOString().split("T")[0];

  const staticRoutes = [
    { url: `${baseUrl}/`, lastmod: currentDate, changefreq: "daily", priority: 1.0 },
    { url: `${baseUrl}/dashboard`, lastmod: currentDate, changefreq: "weekly", priority: 0.9 },
    { url: `${baseUrl}/ai-interviewer`, lastmod: currentDate, changefreq: "monthly", priority: 0.9 },
    { url: `${baseUrl}/free-credits`, lastmod: currentDate, changefreq: "monthly", priority: 0.9 },
    { url: `${baseUrl}/profile`, lastmod: currentDate, changefreq: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastmod: currentDate, changefreq: "weekly", priority: 0.8 },
    // { url: `${baseUrl}/roadmap-generator`, lastmod: "2025-05-10", changefreq: "weekly", priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastmod: currentDate, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, lastmod: currentDate, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/cancellation`, lastmod: currentDate, changefreq: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastmod: currentDate, changefreq: "daily", priority: 0.9 },
  ];

  let blogRoutes = [];

  try {
    // Direct fetch to ensure it works in all environments
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.vokely.io/app';
    const blogsResponse = await fetch(`${apiUrl}/api/blogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (blogsResponse.ok) {
      const data = await blogsResponse.json();
      blogRoutes = data.blogs.map(blog => {
        const date = new Date(
          blog.updatedAt || blog.publishedAt || blog.createdAt || new Date()
        ).toISOString().split("T")[0];

        return {
          url: `${baseUrl}/blog/${blog.slug}`,
          lastmod: date,
          changefreq: "weekly",
          priority: 0.7,
        };
      });
      staticRoutes.push(...blogRoutes);
    } else {
      console.error("Failed to fetch blogs for sitemap, status:", blogsResponse.status);
    }
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return staticRoutes;
}