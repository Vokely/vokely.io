// app/(main)/blog/[slug]/page.js
import BlogDetails from "@/components/blog/BlogDetails";
import RenderJsonContent from "@/components/blog/RenderJsonContent";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/src/utils/siteMetaData";
import { slug as slugify } from "github-slugger";
import Image from "next/image";
import { getAllBlogs, getBlogById } from "@/lib/blogsUtil";


// export async function generateStaticParams() {
//   // Fetch the slugs of all blog posts
//   try {
//     const response = await getAllBlogs();
//     if (!response.ok) {
//       console.error('Failed to fetch blogs for static generation');
//       return []; // Return empty array as fallback
//     }
    
//     const blogs = await response.json();
    
//     // Return an array of objects with the slug parameter
//     return blogs.blogs.map((blog) => ({
//       slug: blog.slug,
//     }));
//   } catch (error) {
//     console.error('Error generating static params for blogs:', error);
//     return []; // Return empty array in case of error
//   }
// }
// Generate metadata for the page (server-side)
export async function generateMetadata({ params }) {
  const slug = params.slug;
  // Fetch blog data from your API
  try {
    const response = await getBlogById(slug);
    const blog = await response.json();

    if (!response.ok) {
      console.error(data)
      return {
        title: 'Blog Not Found',
        description: 'The requested blog post could not be found'
      };
    }
    
    if (!blog) {
      return {
        title: 'Blog Not Found',
        description: 'The requested blog post could not be found'
      };
    }

    const publishedAt = new Date(blog.publishedAt).toISOString();
    const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();

    let imageList = [siteMetadata.socialBanner];
    if (blog.image) {
      imageList = blog.image !== "" 
        ? [blog.image.includes("http") ? blog.image : siteMetadata.siteUrl + blog.image]
        : [siteMetadata.socialBanner]; // Fallback to default if image is empty
    }
    
    const ogImages = imageList.map((img) => {
      return { url: img.includes("http") ? img : siteMetadata.siteUrl + img };
    });

    const authors = blog?.author ? [blog.author] : siteMetadata.author;

    return {
      title: blog.title,
      description: blog.description,
      openGraph: {
        title: blog.title,
        description: blog.description,
        url: siteMetadata.siteUrl + "/blog/" + blog.slug,
        siteName: siteMetadata.title,
        locale: "en_US",
        type: "article",
        publishedTime: publishedAt,
        modifiedTime: modifiedAt,
        images: ogImages,
        authors: authors.length > 0 ? authors : [siteMetadata.author],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.description,
        images: ogImages,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: 'Blog',
      description: 'View our blog posts'
    };
  }
}

// Generate a simple TOC from the content
function generateTOC(content) {
  if (!content || !Array.isArray(content)) return [];
  
  const headings = content.filter(item => item.type === 'heading' && item.level > 1);
  
  // Transform headings into a TOC structure
  return headings.map(heading => ({
    // url: `#${heading.text.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')}`,
    title: heading.text,
    items: [] // For simplicity, not handling nested headings
  }));
}

function TableOfContentsItem({ item, level = "two" }) {
  return (
    <li className="py-1">
      <a
        href={item.url}
        data-level={level}
        className="data-[level=two]:pl-0 data-[level=two]:pt-2
                  data-[level=two]:border-t border-solid border-dark/40
                  data-[level=three]:pl-4
                  sm:data-[level=three]:pl-6
                  flex items-center justify-start"
      >
        {level === "three" && (
          <span className="flex w-1 h-1 rounded-full bg-dark ur-2">&nbsp;</span>
        )}
        <span className="hover:underline">{item.title}</span>
      </a>
      {item.items.length > 0 && (
        <ul className="mt-1">
          {item.items.map((subItem) => (
            <TableOfContentsItem 
              key={subItem.url} 
              item={subItem} 
              level="three"
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Server Component main page
export default async function BlogPage({ params }) {
  const slug = params.slug;
  
  // Fetch blog data from your API
  let blog = null;
  let error = null;
  
  try {
    const response = await getBlogById(slug);
    if (!response.ok) throw new Error("Failed to fetch blog");
    
    const data = await response.json();
    blog = data;
    
    if (!blog) throw new Error("Blog not found");
    
  } catch (err) {
    console.error("Error fetching blog:", err);
    error = err.message;
  }

  // Handle error state
  if (error || !blog) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-2xl font-bold text-center">
          {error || "Blog not found or failed to load."}
        </p>
      </div>
    );
  }

  // Create a URL for the blog
  blog.url = `/blog/${blog.slug}`;
  
  // Add reading time (simplified calculation)
  const wordCount = blog.content.reduce((count, item) => {
    if (item.type === 'paragraph') {
      return count + item.text.split(/\s+/).length;
    }
    if (item.type === 'list') {
      return count + item.items.join(' ').split(/\s+/).length;
    }
    if (item.type === 'heading') {
      return count + item.text.split(/\s+/).length;
    }
    return count;
  }, 0);
  
  blog.readingTime = {
    text: `${Math.ceil(wordCount / 225)} min read`, // Assuming 225 words per minute
    minutes: Math.ceil(wordCount / 225),
    words: wordCount
  };

  // Generate table of contents
  const toc = generateTOC(blog.content);

  // JSON-LD schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": blog.title,
    "description": blog.description,
    "image": blog.image ? [blog.image] : [siteMetadata.socialBanner],
    "datePublished": new Date(blog.publishedAt).toISOString(),
    "dateModified": new Date(blog.updatedAt || blog.publishedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": blog?.author || siteMetadata.author,
      "url": siteMetadata.twitter,
    }]
  };

  // Create a placeholder image object if no image is provided
  const defaultImage = {
    src: "https://storage.googleapis.com/genresume_bucket/blogs/ai-resume-builder-usage-guide/ai-resume-builder-usage-guide.png", // Your default image path
    width: 1200,
    height: 630,
    blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  };

  // Use the blog image or default
  const blogImage = blog.image && blog.image !== "" 
    ? { src: blog.image, width: 1200, height: 630, blurDataURL: defaultImage.blurDataURL }
    : defaultImage;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Tag
              name={blog.tags[0]}
              link={`/categories/${slugify(blog.tags[0])}`}
              className="px-6 text-sm py-2"
            />
            <h1
              className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
            >
              {blog.title}
            </h1>
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
          <Image
            src={blogImage.src}
            placeholder="blur"
            blurDataURL={blogImage.blurDataURL}
            alt={blog.title}
            width={blogImage.width}
            height={blogImage.height}
            className="aspect-square w-full h-full object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        <BlogDetails blog={blog} slug={slug} />

        <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
          <div className="col-span-12 lg:col-span-4">
            <details
              className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
              open
            >
              <summary className="text-lg font-semibold capitalize cursor-pointer">
                Table Of Content
              </summary>
              <ul className="mt-4 font-in text-base">
                {toc.map((item,i) => (
                  <TableOfContentsItem key={i} item={item} />
                ))}
              </ul>
            </details>
          </div>
          <RenderJsonContent content={blog.content} />
        </div>
      </article>
    </>
  );
}