import { useState, useEffect } from 'react';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import Descend from '../assets/descending.svg';
import Ascend from '../assets/ascending.svg';
import Date from '../assets/date.svg';
import DateClicked from '../assets/dateClicked.svg';
import Likes from '../assets/likes.svg';
import LikesClicked from '../assets/likesClicked.svg';
import Comments from '../assets/comments.svg';
import CommentsClicked from '../assets/commentsClicked.svg';
import { tags } from '../services/postService';

function QuickNav({
  isOpen,
}: {
  isOpen: boolean;

  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`fixed sm:fixed max-h-[800px] flex-col  top-24 lg:mr-[1vw] sm:max-lg:top-24 lg:top-[calc(max(2rem,25vh-6rem))] right-0 flex bg-Background/Bottom text-center w-[260px] lg:w-[22vw] xl:w-[19vw] h-4/5 pt-4 pl-4 min-h-[400px]  rounded-3xl border-Primary/Dark border-solid box-border border-2 z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 sm:static sm:max-xl:pl-4 xl:pl-6 `}
      >
        {/* <div className='mb-4 mt-2'>
          <div className='w-8 inline-block fixed left-6'>
            <img src={Search} alt='Search icon'></img>
          </div>
          <div className='ml-2 sm:max-xl:ml-2 xl:-ml-2'>
            <input
              className='rounded-3xl text-left bg-Background/Middle text-Primary/Light text-lg placeholder-Primary/Light w-40 pl-2 sm:max-xl:pl-2 xl:pl-3'
              placeholder='Search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></input>
          </div>
        </div> */}
        <p className='text-left text-white text-xl flex ml-10 font-semibold'>Navigation</p>
        <br />
        <div>
          <button>
            <div className='inline-block flex-shrink-0 flex-row flex items-center space-x-2'>
              <img
                src={
                  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                }
                alt='Profile Icon'
                className='w-10 h-10 rounded-full object-cover'
              />
              <p className='text-lg text-white'>Group name</p>
            </div>
          </button>
        </div>
        <p className='text-left text-white text-xl flex ml-10 font-semibold'>Popular</p>
        <br />
        <p className='text-left text-white text-xl flex ml-10 font-semibold'>Recent</p>
        <br />
      </div>
    </>
  );
}

export default QuickNav;

