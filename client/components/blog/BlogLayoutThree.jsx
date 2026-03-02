'use client'
import Link from 'next/link';

const BlogLayoutThree = ({ blog }) => {
  blog.url = `/blog/${blog.slug}`;
  return (
    <div className="group flex flex-col items-center text-dark">
      <Link href={blog.url} className="h-full rounded-xl overflow-hidden">
        <img
          src={`${blog.image}?t=${Date.now()}`}
          alt={blog.title}
          className="aspect-[4/3] w-full h-auto object-cover group-hover:scale-105 transition-all ease duration-300"
        />
      </Link>

      <div className="flex flex-col w-full mt-4">
        <p className='text-primary font-semibold uppercase'>{blog.tags[0]}</p>
        <Link href={blog.url} className="inline-block my-1">
          <h2 className="font-semibold capitalize text-base">
            <span className="bg-gradient-to-r from-accent/50 to-accent/50 bg-[length:0px_6px] group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
              {blog.title}
            </span>
          </h2>
        </Link>

        <p className="text-sm mt-2">{blog.description}</p>
      </div>
    </div>
  );
};

export default BlogLayoutThree;
