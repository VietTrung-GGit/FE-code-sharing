import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className='flex justify-center items-center mt-4'>
      <div className='w-8 h-8 border-4 border-t-transparent border-Accent/Target border-solid rounded-full animate-spin'></div>
    </div>
  );
};

export default LoadingSpinner;

