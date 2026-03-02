'use client'
import Link from "next/link";
import BlogLayoutThree from "../blog/BlogLayoutThree";

const RecentPosts = ({ sortedBlogs }) => {

  return (
    <div className="w-full px-5 p-6 sm:p-8 md:px-12 lg:px-16 mt-16 sm:mt-24 flex flex-col items-center justify-center">
      <div className="w-full flex justify-between">
        <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">
          Recent Posts
        </h2>
        <Link
          href="/categories/all"
          className="inline-block font-medium text-accent dark:text-accentDark underline underline-offset-2      text-base md:text-lg"
        >
          view all
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-auto gap-16 mt-16">
        {sortedBlogs.map((blog, index) => {
          return (
            <article key={index} className="col-span-1 row-span-1 relative">
              <BlogLayoutThree blog={blog} />
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default RecentPosts;
