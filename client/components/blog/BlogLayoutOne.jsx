'use client'
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Tag from '../Elements/Tag';

const BlogLayoutOne = ({ blog }) => {
  return (
    <div className="group inline-block overflow-hidden rounded-lg">
      <div className="absolute top-0 left-0 bottom-0 right-0 h-full bg-gradient-to-b from-transparent from-0% to-dark/90 rounded-lg z-10" />
      <img
        src={`${blog.image}?t=${Date.now()}`}
        alt={blog.title}
        className="w-full h-full object-center object-cover rounded-lg group-hover:scale-105 transition-all ease duration-300"
      />

      <div className="absolute bottom-0 p-4 xs:p-6 sm:p-10 z-20 w-full">
        <Tag link={`/categories/${blog.tags[0]}`} name={blog.tags[0]} />
        <Link href={`/blog/${blog.slug}`} className="mt-6">
          <h2 className="font-bold capitalize text-sm xs:text-base sm:text-xl md:text-2xl text-light mt-2 sm:mt-4">
            <span className="bg-gradient-to-r from-accent to-accent bg-[length:0px_6px] group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
              {blog.title}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default BlogLayoutOne;
