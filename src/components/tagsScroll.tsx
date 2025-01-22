import React, { useRef } from 'react';

interface TagsScrollProps {
  tags: string[];
  containerClassName?: string;
}

const TagsScroll: React.FC<TagsScrollProps> = ({
  tags,
  containerClassName = 'flex gap-2 overflow-x-auto w-full sm:w-64',
}) => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -88, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 88, behavior: 'smooth' });
    }
  };

  const showButtons = tags.length > 3;
  const alignmentClass = tags.length <= 3 ? 'justify-center sm:justify-end' : ' justify-start';
  return (
    <div
      className={`flex items-center space-x-1 xsm:w-auto md:mr-0 ${showButtons ? 'xxsm:-mr-7 -mr-7' : 'xxsm:mr-2 mr-0'}`}
    >
      {/* Left Scroll Button */}
      {showButtons && (
        <button className='rounded-full hover:text-Primary/Light text-lg' onClick={scrollLeft}>
          &lt;
        </button>
      )}

      {/* Scrollable Tags Container */}
      <div
        ref={scrollContainer}
        className={`${containerClassName} no-scrollbar ${alignmentClass}`}
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
              className='bg-Primary/Light flex justify-center text-Primary/Dark text-sm px-2 rounded-3xl w-20 py-1 flex-shrink-0' // Fixed width for each tag
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
        <button className='rounded-full hover:text-Primary/Light text-lg' onClick={scrollRight}>
          &gt;
        </button>
      )}
    </div>
  );
};

export default TagsScroll;

