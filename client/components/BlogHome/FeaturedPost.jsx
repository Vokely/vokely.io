import BlogLayoutOne from '../blog/BlogLayoutOne';
import BlogLayoutTwo from '../blog/BlogLayoutTwo';

const FeaturedPost = ({ featuredBlogs }) => {
  console.log(featuredBlogs)
  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center px-5 p-6 sm:p-8 md:px-12 lg:px-16">
      <h2 className="inline-block w-full text-2xl font-bold capitalize text-dark dark:text-light md:text-4xl">
        Featured Posts
      </h2>

      <div className="grid grid-cols-2 grid-rows-2 gap-x-6 sm:mt-16">
        <div className="relative col-span-2 row-span-2 sm:col-span-1">
          <BlogLayoutOne blog={featuredBlogs[0]} />
        </div>
        <div className="relative col-span-2 row-span-1 sm:col-span-1">
          <BlogLayoutTwo blog={featuredBlogs[1]} />
        </div>
        <div className="relative col-span-2 row-span-2 sm:col-span-1">
          <BlogLayoutTwo blog={featuredBlogs[2]} />
        </div>
      </div>
    </div>
  );
};

export default FeaturedPost;
