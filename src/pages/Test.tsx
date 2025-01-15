import { useRef } from 'react';

const HorizontalScroll = () => {
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className='flex items-center space-x-2'>
      {/* Left Button */}
      <button className='p-2 bg-gray-300 rounded-full hover:bg-gray-400' onClick={scrollLeft}>
        ←
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollContainer}
        className='flex overflow-x-auto no-scrollbar space-x-2 w-64' // Set fixed width
        style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
      >
        {/* Tags */}
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 1</span>
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 2</span>
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 3</span>
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 4</span>
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 5</span>
        <span className='px-3 py-1 bg-blue-500 text-white rounded-full'>Tag 6</span>
      </div>

      {/* Right Button */}
      <button className='p-2 bg-gray-300 rounded-full hover:bg-gray-400' onClick={scrollRight}>
        →
      </button>
    </div>
  );
};

export default HorizontalScroll;

