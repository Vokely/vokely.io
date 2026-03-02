import React from "react";

export default function PageDots({ currentPage, pages, onPageChange,isMobile=false, fullScreenMode=false }) {
  const pageArray = Array.isArray(pages) ? pages : Array.from({ length: pages }, (_, i) => i);
  let containerClasses = '';

  if (!isMobile) {
    if (fullScreenMode) {
      containerClasses = 'relative inset-0 flex flex-col justify-center items-center gap-3 z-50';
    } else {
      containerClasses = 'absolute right-5 top-[35%] gap-2 flex-col flex flex-col justify-center items-center gap-3 z-50';
    }
  } else {
    containerClasses = 'justify-center gap-1';
  }

  return (
    <div className={`${containerClasses} flex items-center`}>
      {/* Page Counter */}
      <p className="text-gray-600">
        <span className="text-primary font-bold text-sm md:text-normal">{currentPage + 1}</span>/{pageArray.length}
      </p>

      {/* Page Dots */}
      {pageArray.map((_, i) => (
        <div
          key={i}
          className={`cursor-pointer h-[15px] w-[15px] md:h-[30px] md:w-[30px] rounded-full transition-transform duration-300 ${
            currentPage === i ? "bg-primary scale-100" : "bg-gray-300 scale-75"
          }`}
          onClick={() => onPageChange(i)}
        ></div>
      ))}
    </div>
  );
}
