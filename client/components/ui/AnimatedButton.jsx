'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const AnimatedButton = ({
  children,
  href,
  className,
  onClick,
  ...props
}) => {
  return (
    <div className="relative">
      {href ? (
        <Link
          href={href}
          className={cn(
            "inline-block",
            className
          )}
          {...props}
        >
          <button
            className="relative py-[0.1em] px-[0.25em] w-[13em] h-[4.2em] bg-primary border-[0.08em] border-solid border-white rounded-[0.3em] text-[12px] cursor-pointer"
          >
            <span
              className="relative flex justify-center items-center bottom-[0.4em] w-[8.25em] h-[2.5em] bg-primary rounded-[0.2em] text-[1.5em] text-white border-[0.08em] border-solid border-white shadow-[0_0.4em_0.1em_0.019em_#fff] transition-all duration-500"
            >
              {children}
            </span>
          </button>
        </Link>
      ) : (
        <button
          className="relative py-[0.1em] px-[0.25em] w-[13em] h-[4.2em] bg-primary border-[0.08em] border-solid border-white rounded-[0.3em] text-[12px] cursor-pointer"
          onClick={onClick}
          {...props}
        >
          <span
            className="relative flex justify-center items-center bottom-[0.4em] w-[8.25em] h-[2.5em] bg-primary rounded-[0.2em] text-[1.5em] text-white border-[0.08em] border-solid border-white shadow-[0_0.4em_0.1em_0.019em_#fff] transition-all duration-500"
          >
            {children}
          </span>
        </button>
      )}

      {/* CSS for hover effect - exactly as in the provided snippet */}
      <style jsx>{`
        button span:hover {
          transition: all 0.5s;
          transform: translate(0, 0.4em);
          box-shadow: 0 0 0 0 #fff;
        }

        button span:not(:hover) {
          transition: all 1s;
        }
      `}</style>
    </div>
  );
};

export default AnimatedButton;
