// 'use client'
import { cx } from "@/src/utils.jsx";
// import Link from "next/link";

const Tag = ({ link = "#", name, ...props }) => {
  return (
    <div
      // href={link}
      className=
        "inline-block py-2 sm:py-3 px-6 sm:px-10  bg-black text-white rounded-full capitalize font-semibold border-2 border-solid border-white transition-all ease duration-200 text-sm sm:text-base"
    >
      {name}
    </div>
  );
};

export default Tag;
