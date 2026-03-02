// app/api/sitemap.xml.js
import { getAllBlogs } from "@/lib/blogsUtil";
import sitemapData from '@/app/sitemap';

export default async function handler(req, res) {
  // Set cache control headers for performance
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=59'
  );
  
  try {
    // Fetch all blog posts using your function
    const blogsResponse = await getAllBlogs();
    
    // Process the response
    let blogs = [];
    if (blogsResponse.ok) {
      const data = await blogsResponse.json();
      blogs = data.blogs;
    } else {
      console.error('Failed to fetch blogs for sitemap');
    }
    
    // Get the static routes from sitemap.js
    const staticRoutes = await sitemapData();
    
    // XML header with proper encoding
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes from sitemap.js
    for (const route of staticRoutes) {
      const lastModDate = route.lastModified instanceof Date ? 
        route.lastModified.toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
        
      sitemap += `
  <url>
    <loc>${route.url}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${route.changeFrequency || 'weekly'}</changefreq>
    <priority>${route.priority || 0.7}</priority>
  </url>`;
    }
    
    // Add dynamic blog posts
    sitemap += blogs.map(blog => {
      // Format dates properly for XML (YYYY-MM-DD)
      let lastmod;
      if (blog.updatedAt) {
        lastmod = new Date(blog.updatedAt).toISOString().split('T')[0];
      } else if (blog.publishedAt) {
        lastmod = new Date(blog.publishedAt).toISOString().split('T')[0];
      } else if (blog.createdAt) {
        lastmod = new Date(blog.createdAt).toISOString().split('T')[0];
      } else {
        lastmod = new Date().toISOString().split('T')[0];
      }
        
      return `
  <url>
    <loc>https://vokely.io/blog/${blog.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join('');
    
    // Close the XML
    sitemap += `
</urlset>`;

    // Set proper content type and send the response
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
}