import React, { useRef } from 'react';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';
import { tagColors } from '../utils/helpers';

interface TagsScrollProps {
  tags: string[];
  containerClassName?: string;
}

const TagsScroll: React.FC<TagsScrollProps> = ({
  tags,
  containerClassName = 'flex gap-[2px] overflow-x-auto w-[165px] xxsm:w-[236px]',
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -70, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 70, behavior: 'smooth' });
    }
  };

  const showButtons = tags.length > 3;
  return (
    <div className={`flex items-center space-x-[2px] justify-start xsm:w-auto absolute`}>
      {/* Left Scroll Button */}
      {showButtons && (
        <button className='hover:text-Primary/Light text-lg -ml-2' onClick={scrollLeft}>
          <IoMdArrowDropleft />
        </button>
      )}

      {/* Scrollable Tags Container */}
      <div
        ref={scrollContainer}
        className={`${containerClassName} no-scrollbar justify-start space-x-1`}
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          maxWidth: showButtons ? 'calc(100% - 4rem)' : '100%', // Adjust width to accommodate buttons
        }}
      >
        {tags.length > 0 ? (
          tags.map((tagName, index) => (
            <span
              key={index}
              className={`flex-shrink-0 ${tagColors[tagName]} text-[8px] sm:text-[11px] flex justify-center text-Primary/Dark px-2 w-10 sm:w-16 rounded-xl py-[1px]`}
            >
              {tagName}
            </span>
          ))
        ) : (
          <span className='text-gray-500'>No tags available</span>
        )}
      </div>

      {/* Right Scroll Button */}
      {showButtons && (
        <button className='hover:text-Primary/Light text-lg' onClick={scrollRight}>
          <IoMdArrowDropright />
        </button>
      )}
    </div>
  );
};

export default TagsScroll;

