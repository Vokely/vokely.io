import Link from 'next/link';
import formatBlogDate from '@/lib/dateUtil';

const BlogLayoutTwo = ({ blog }) => {
  const formattedDate = formatBlogDate(blog.publishedAt);
  return (
    <div className="group grid grid-cols-12 gap-4 items-center text-dark h-full">
      <Link href={`/blog/${blog.slug}`} className="col-span-12 lg:col-span-4 h-[90%] rounded-xl overflow-hidden">
        <img
          src={`${blog.image}?t=${Date.now()}`}
          alt={blog.title}
          className="w-full h-full object-center object-cover rounded-lg group-hover:scale-105 transition-all ease duration-300"
        />
      </Link>

      <div className="col-span-12 lg:col-span-8 w-full">
        <p className='text-primary font-semibold uppercase'>{blog.tags[0]}</p>
        <Link href={`/blog/${blog.slug}`} className="inline-block my-1">
          <h2 className="font-semibold capitalize text-base sm:text-lg w-full lap:w-[70%]">
            <span className="bg-gradient-to-r from-accent/50 to-accent/50 bg-[length:0px_6px] group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 ">
              {blog.title}
            </span>
          </h2>
        </Link>

        <p className="text-sm sm:text-base mt-2 text-gray-400 font-semibold">{formattedDate}</p>
      </div>
    </div>
  );
};

export default BlogLayoutTwo;
