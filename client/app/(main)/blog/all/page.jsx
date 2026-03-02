'use client';

import { useEffect, useState } from 'react';
import { getAllBlogs } from '@/lib/blogsUtil';
import BlogLayoutTwo from '@/components/blog/BlogLayoutTwo';
import Spinner from '@/components/reusables/Spinner';
import Link from 'next/link';
import { sortBlogs } from '@/src/utils';

export default function AllBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getAllBlogs();
        if (!res.ok) throw new Error('Failed to fetch blogs');
        const data = await res.json();

        const blogsWithImages = (data.blogs || []).map((blog) => ({
          ...blog,
          image: blog.image || 'https://storage.googleapis.com/genresume_bucket/blogs/genresume-default-blog-image.png',
        }));

        setBlogs(sortBlogs(blogsWithImages));
      } catch (err) {
        console.error('Failed to load blogs:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center py-12">
        <Spinner />
        <p className="text-gray-500 mt-4">Loading blogs...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-700">Unable to load blogs</h2>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Something went wrong while fetching our latest posts. Please try again later.
        </p>
      </section>
    );
  }

  return (
    <main className="w-full px-4 md:px-12 lg:px-20 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-dark dark:text-light mb-4">Explore Our Blog</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Read the latest insights, tips, and trends on careers, resumes, and personal branding.
        </p>
      </section>

      {/* Blog List */}
      <section className="grid gap-12 md:gap-16">
        {blogs.map((blog) => (
          <div key={blog.slug}>
            <BlogLayoutTwo blog={blog} />
          </div>
        ))}
      </section>

      {/* Optional CTA Section */}
      <section className="mt-24 text-center">
        <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">Want More Career Tips?</h2>
        <p className="text-gray-500 mb-6 max-w-xl mx-auto">
          Stay updated with expert advice by subscribing to our newsletter.
        </p>
        <Link
          href="/subscribe"
          className="px-6 py-3 bg-accent text-white font-semibold rounded-full hover:bg-accent-dark transition"
        >
          Subscribe Now
        </Link>
      </section>
    </main>
  );
}