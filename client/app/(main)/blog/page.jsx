'use client'
import { useEffect, useState } from 'react'
import { getAllBlogs } from '@/lib/blogsUtil'
import BlogCoverSection from "@/components/BlogHome/BlogCoverSection"
import FeaturedPost from "@/components/BlogHome/FeaturedPost"
import RecentPosts from "@/components/BlogHome/RecentPosts"
import Spinner from '@/components/reusables/Spinner'
import { sortBlogs } from "@/src/utils.jsx"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [coverBlog, setCoverBlog] = useState(null)
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const allBlogs = await getAllBlogs()
        if (!allBlogs.ok) throw new Error('Failed to fetch blogs')
        const response = await allBlogs.json()

        const blogsWithFallbackImages = (response.blogs || []).map((blog) => ({
          ...blog,
          image: blog.image || 'https://storage.googleapis.com/genresume_bucket/blogs/genresume-default-blog-image.png',
        }))

        const sorted = sortBlogs(blogsWithFallbackImages)
        const cover = sorted.find((blog) => blog.isCoverImage)
        const featured = sorted.filter((blog) => blog.featured)
        const recent = sorted.filter((blog) => blog !== cover)

        setBlogs(sorted)
        setCoverBlog(cover)
        setFeaturedBlogs(featured)
        setRecentPosts(recent)
      } catch (err) {
        console.error("Failed to load blogs:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  return (
    <main className="flex flex-col items-center justify-center w-full px-4 py-12">
      <h1 className="sr-only">Vokely Blog - Career Tips & Resume Insights</h1>

      {loading ? (
        <section className="flex flex-col items-center justify-center min-h-[50vh]">
          <Spinner />
          <p className="mt-4 text-gray-500">Loading blogs...</p>
        </section>
      ) : error ? (
        <section className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-700">Unable to load blogs</h2>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Something went wrong while fetching our latest posts. Please try again later.
          </p>
        </section>
      ) : (
        <>
          <BlogCoverSection coverBlog={coverBlog} />
          <FeaturedPost featuredBlogs={featuredBlogs} />
          <RecentPosts sortedBlogs={recentPosts} />
        </>
      )}
    </main>
  )
}