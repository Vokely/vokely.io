'use client'
import Image from 'next/image'
import Link from 'next/link'
import Tag from '../Elements/Tag'

const BlogCoverSection = ({ coverBlog }) => {
  return (
    <section className="w-full min-h-fit">
      <Link href={`/blog/${coverBlog.slug}`}>
        <article className="relative flex flex-col items-start justify-end px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="relative w-full h-[45vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden rounded-md sm:rounded-lg md:rounded-2xl">
            <Image
              src={`${coverBlog.image}?t=${Date.now()}`}
              alt={coverBlog.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              priority
              className="object-cover object-center rounded-md sm:rounded-lg md:rounded-xl"
            />

            {/* Content Overlay */}
            <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-8 z-20 max-w-[90%] sm:max-w-[70%] md:max-w-[50%]">
              <Tag link={`/categories/${coverBlog.tags[0]}`} name={coverBlog.tags[0]} />

              <h1 className="text-white font-bold mt-3 sm:mt-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
                  <span>{coverBlog.title}</span>
              </h1>

              <p className="text-white mt-2 sm:mt-3 text-sm sm:text-base md:text-lg font-medium">
                {coverBlog.description}
              </p>
            </div>
          </div>
        </article>
      </Link>
    </section>
  )
}

export default BlogCoverSection