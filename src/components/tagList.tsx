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

function TagList({
  isOpen,
  onFilterChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filters: {
    selectedTags: string[];
    sortBy: string;
    order: string;
    searchQuery: string;
  }) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeButton, setActiveButton] = useState<'descending' | 'ascending' | null>('descending');
  const [methodButton, setMethodButton] = useState<'likes' | 'date' | 'comments' | null>('date');

  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');

  const handleOrderStateClick = (newOrder: 'ascending' | 'descending') => {
    setActiveButton(newOrder);
    setOrder(newOrder);
  };
  const handleCriteriaMethodChange = (newCriteria: 'date' | 'likes' | 'comments') => {
    setCriteria(newCriteria);

    setMethodButton(newCriteria);
  };

  const handleButtonClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((selectedTag) => selectedTag !== tag) : [...prev, tag],
    );
  };

  // This function triggers when any filter or search query changes.
  const handleFiltersChange = () => {
    onFilterChange({
      selectedTags,
      sortBy: methodButton || 'date', // Default to date if no sort method is selected
      order: activeButton || 'descending', // Default to descending if no order is selected
      searchQuery,
    });
  };

  useEffect(() => {
    handleFiltersChange();
    // Trigger filter change whenever state changes
  }, [selectedTags, searchQuery, activeButton, methodButton, criteria]);

  return (
    <div
      className={`flex flex-col top-28 right-0 bg-Background/Bottom text-center w-64 h-3/4 pt-4 pl-4 min-h-[500px] rounded-l-3xl fixed border-Primary/Dark border-solid box-border border-2 z-40
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0 sm:static sm:max-xl:pl-4 xl:max-2xl:pl-6 lg:max-2xl:mr-6 sm:max-2xl:fixed sm:max-lg:rounded-l-3xl lg:max-2xl:rounded-3xl sm:max-lg:top-28 lg:max-2xl:top-8`}
    >
      <div className='mb-4 mt-2'>
        <div className='w-8 inline-block fixed left-6'>
          <img src={Search} alt='Search icon'></img>
        </div>
        <div className='ml-2 sm:max-xl:ml-2 xl:max-2xl:-ml-2'>
          <input
            className='rounded-3xl text-left bg-Background/Middle text-Primary/Light text-lg placeholder-Primary/Light w-40 pl-2 sm:max-xl:pl-2 xl:max-2xl:pl-3'
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          ></input>
        </div>
      </div>

      {/*ASC/DESC BUTTONS*/}
      <div className='mb-4'>
        <button
          className='w-[140px]'
          onClick={() =>
            handleOrderStateClick(activeButton === 'ascending' ? 'descending' : 'ascending')
          }
        >
          <div className='w-8 inline-block fixed left-6'>
            <img
              src={activeButton === 'descending' ? Descend : Ascend}
              alt='Descending/Ascending icon'
            ></img>
          </div>
          <div className='w-28 -ml-6 inline-block sm:max-xl:-ml-6 xl:max-2xl:-ml-8'>
            <p className='text-left text-Primary/Light text-lg'>
              {activeButton === 'descending' ? 'Descending' : 'Ascending'}
            </p>
          </div>
        </button>
      </div>

      {/*date*/}
      <div className='mb-4'>
        <button className='w-[140px]' onClick={() => handleCriteriaMethodChange('date')}>
          <div className='w-8 inline-block fixed left-16'>
            <img src={methodButton === 'date' ? DateClicked : Date} alt='Date icon'></img>
          </div>
          <div className='inline-block -ml-2'>
            <p
              className={`text-left text-lg ${methodButton === 'date' ? 'text-Primary/Dark' : 'text-Primary/Light'}`}
            >
              Date
            </p>
          </div>
        </button>
      </div>

      {/*likes*/}
      <div className='mb-4'>
        <button className='w-[140px]' onClick={() => handleCriteriaMethodChange('likes')}>
          <div className='w-8 inline-block fixed left-16'>
            <img src={methodButton === 'likes' ? LikesClicked : Likes} alt='Likes icon'></img>
          </div>
          <div className='inline-block ml-0'>
            <p
              className={`text-left text-lg ${methodButton === 'likes' ? 'text-Primary/Dark' : 'text-Primary/Light'}`}
            >
              Likes
            </p>
          </div>
        </button>
      </div>

      {/*comments*/}
      <div className='mb-4'>
        <button className='w-[140px]' onClick={() => handleCriteriaMethodChange('comments')}>
          <div className='w-8 inline-block fixed left-16'>
            <img
              src={methodButton === 'comments' ? CommentsClicked : Comments}
              alt='Comments icon'
            ></img>
          </div>
          <div className='inline-block ml-8'>
            <p
              className={`text-left text-lg ${methodButton === 'comments' ? 'text-Primary/Dark' : 'text-Primary/Light'}`}
            >
              Comments
            </p>
          </div>
        </button>
      </div>

      {/*filter by tags*/}
      <div className='mb-4'>
        <div className='w-8 inline-block fixed left-6'>
          <img src={Filter} alt='Fliter icon'></img>
        </div>
        <div className='w-32 -ml-6 inline-block sm:max-xl:-ml-6 xl:max-2xl:-ml-8'>
          <p className='text-left text-Primary/Light text-lg'>Filter by tags:</p>
        </div>
      </div>

      {/*tags*/}
      {/*tags*/}
      <div className='flex-1 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
        {tags.map((tag) => (
          <button key={tag} className='w-24 my-2 mr-2' onClick={() => handleButtonClick(tag)}>
            <div className='flex flex-col'>
              <div
                className={`${
                  selectedTags.includes(tag) ? 'bg-Primary/Light' : 'bg-white'
                } rounded-3xl p-1`}
              >
                <p className='text-Primary/Dark'>{tag}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagList;

