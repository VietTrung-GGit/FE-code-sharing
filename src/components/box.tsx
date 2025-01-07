import React, { FC } from 'react';

interface BoxProps {
  content: string;
  closeBox: () => void;
}

const Box: FC<BoxProps> = ({ content, closeBox }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-gray-800 text-white p-4 rounded-lg shadow-md max-w-sm w-full">
        <span className="block">{content}</span>
        <button
          className="absolute top-2 right-2 text-white"
          aria-label="Close"
          onClick={closeBox}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Box;
