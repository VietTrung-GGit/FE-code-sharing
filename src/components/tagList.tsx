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
  onFilterChange: (filters: { selectedTags: string[]; sortBy: string; order: string }) => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  const buttons: { label: string; criteriaKey: 'date' | 'likes' | 'comments'; svg: JSX.Element }[] =
    [
      {
        label: 'Date',
        criteriaKey: 'date',
        svg: (
          <svg
            width='25'
            height='25'
            viewBox='0 0 25 25'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M1 8.5H23.5M18.5 13.5017L6 13.5M10.1666 18.5006L6 18.5M6 1V3.5M18.5 1V3.5M5 23.5H19.5C20.9001 23.5 21.6003 23.5 22.135 23.2275C22.6054 22.9879 22.9879 22.6054 23.2275 22.135C23.5 21.6003 23.5 20.9001 23.5 19.5V7.5C23.5 6.09986 23.5 5.3998 23.2275 4.86503C22.9879 4.39461 22.6054 4.01216 22.135 3.77249C21.6003 3.5 20.9001 3.5 19.5 3.5H5C3.59987 3.5 2.8998 3.5 2.36503 3.77249C1.89461 4.01216 1.51216 4.39461 1.27249 4.86503C1 5.3998 1 6.09986 1 7.5V19.5C1 20.9001 1 21.6003 1.27249 22.135C1.51216 22.6054 1.89461 22.9879 2.36503 23.2275C2.8998 23.5 3.59986 23.5 5 23.5Z'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
        ),
      },
      {
        label: 'Likes',
        criteriaKey: 'likes',
        svg: (
          <svg
            width='22'
            height='21'
            viewBox='0 0 22 21'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M21.2173 10.122C21.6248 10.409 22 10.6937 22 11.6947C22 12.698 21.4697 13.104 20.9023 13.3863C21.1341 13.7673 21.2082 14.2249 21.1084 14.6603C20.9301 15.463 20.2006 16.086 19.5522 16.2703C19.8324 16.723 19.9204 17.1687 19.5869 17.717C19.1585 18.4053 18.7857 18.6667 17.1368 18.6667H10.4211C8.13305 18.6667 6.94737 17.3927 6.94737 16.3333V10.885C6.94737 8.015 10.3446 5.57667 10.3446 3.58167L10.0992 1.09667C10.0876 0.945 10.1177 0.574 10.2335 0.466667C10.4187 0.282333 10.9305 0 11.704 0C12.2088 0 12.5446 0.0956664 12.9406 0.287C14.2861 0.933333 14.6358 2.569 14.6358 3.885C14.6358 4.51733 13.6771 6.412 13.5474 7.06767C13.5474 7.06767 15.5552 6.61967 17.8987 6.60333C20.3558 6.58933 21.9491 7.04667 21.9491 8.568C21.9491 9.177 21.4419 9.78833 21.2173 10.122ZM1.38947 9.33333H3.24211C3.61062 9.33333 3.96403 9.48082 4.2246 9.74339C4.4852 10.0059 4.63158 10.362 4.63158 10.7333V19.6C4.63158 19.9712 4.4852 20.3273 4.2246 20.59C3.96403 20.8525 3.61062 21 3.24211 21H1.38947C1.02096 21 0.66755 20.8525 0.406977 20.59C0.146381 20.3273 0 19.9712 0 19.6V10.7333C0 10.362 0.146381 10.0059 0.406977 9.74339C0.66755 9.48082 1.02096 9.33333 1.38947 9.33333Z'
              fill='currentColor'
            />
          </svg>
        ),
      },
      {
        label: 'Comments',
        criteriaKey: 'comments',
        svg: (
          <svg
            width='27'
            height='27'
            viewBox='0 0 27 27'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <mask
              id='path-1-outside-1_712_762'
              maskUnits='userSpaceOnUse'
              x='1.49365'
              y='1.5'
              width='25'
              height='25'
              fill='black'
            >
              <rect fill='white' x='1.49365' y='1.5' width='25' height='25' />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M20.2257 19.4978C21.6447 17.906 22.5071 15.8071 22.5071 13.5067C22.5071 8.53245 18.4747 4.5 13.5004 4.5C8.5261 4.5 4.49365 8.53245 4.49365 13.5067C4.49365 18.481 8.5261 22.5135 13.5004 22.5135C15.2116 22.5135 16.8114 22.0362 18.1739 21.2076L20.7091 21.7514L20.2257 19.4978Z'
              />
            </mask>
            <path
              d='M20.2257 19.4978L17.9863 17.5015L16.973 18.6382L17.2924 20.127L20.2257 19.4978ZM18.1739 21.2076L18.8031 18.2743L17.6354 18.0238L16.615 18.6444L18.1739 21.2076ZM20.7091 21.7514L20.0799 24.6847L24.6152 25.6575L23.6423 21.1222L20.7091 21.7514ZM19.5071 13.5067C19.5071 15.0428 18.9344 16.438 17.9863 17.5015L22.465 21.4942C24.355 19.374 25.5071 16.5713 25.5071 13.5067H19.5071ZM13.5004 7.5C16.8178 7.5 19.5071 10.1893 19.5071 13.5067H25.5071C25.5071 6.8756 20.1315 1.5 13.5004 1.5V7.5ZM7.49365 13.5067C7.49365 10.1893 10.183 7.5 13.5004 7.5V1.5C6.86925 1.5 1.49365 6.8756 1.49365 13.5067H7.49365ZM13.5004 19.5135C10.183 19.5135 7.49365 16.8242 7.49365 13.5067H1.49365C1.49365 20.1379 6.86925 25.5135 13.5004 25.5135V19.5135ZM16.615 18.6444C15.709 19.1954 14.6464 19.5135 13.5004 19.5135V25.5135C15.7769 25.5135 17.9138 24.877 19.7328 23.7708L16.615 18.6444ZM17.5447 24.1409L20.0799 24.6847L21.3383 18.8181L18.8031 18.2743L17.5447 24.1409ZM23.6423 21.1222L23.1589 18.8686L17.2924 20.127L17.7758 22.3806L23.6423 21.1222Z'
              fill='currentColor'
              mask='url(#path-1-outside-1_712_762)'
            />
          </svg>
        ),
      },
    ];

  const handleButtonClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((selectedTag) => selectedTag !== tag) : [...prev, tag],
    );
  };

  // This function triggers when any filter or search query changes.
  const handleFiltersChange = () => {
    onFilterChange({
      selectedTags: selectedTags || [],
      sortBy: methodButton || 'date', // Default to date if no sort method is selected
      order: activeButton || 'descending', // Default to descending if no order is selected
    });
  };

  useEffect(() => {
    handleFiltersChange();
    // Trigger filter change whenever state changes
  }, [selectedTags, activeButton, methodButton, criteria]);

  return (
    <>
      <div
        className={`flex flex-col top-24 right-0 bg-Background/Bottom text-center w-[260px] lg:w-[22vw] xl:w-[19vw] h-4/5 pt-4 pl-4 min-h-[400px] max-h-[800px] rounded-3xl fixed border-Primary/Dark border-solid box-border border-2 z-40
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0 sm:static sm:max-xl:pl-4 xl:pl-6 lg:mr-[1vw] sm:fixed sm:max-lg:top-24 lg:top-[calc(max(2rem,25vh-6rem))]`}
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
        <p className='text-left text-white text-xl justify-center flex mr-2 font-semibold'>
          Filter methods:
        </p>
        <br />
        {/*ASC/DESC BUTTONS*/}
        <div className='mb-4 xl:flex xl:ml-14'>
          <button
            className='w-[140px] '
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
            <div className='w-28 -ml-6 inline-block sm:max-xl:-ml-6 xl:-ml-8'>
              <p className='text-left text-Primary/Light text-lg hover:text-Primary/Target'>
                {activeButton === 'descending' ? 'Descending' : 'Ascending'}
              </p>
            </div>
          </button>
        </div>

        {/*date,likes,comments*/}
        <div className='mb-2'>
          {buttons.map(({ label, criteriaKey, svg }) => (
            <button
              key={criteriaKey}
              className={`w-[140px] ml-14 mb-4 flex items-center space-x-2 ${
                criteria === criteriaKey
                  ? 'text-Primary/Light hover:text-Primary/Target'
                  : 'text-white hover:text-gray-300'
              }`}
              onClick={() => handleCriteriaMethodChange(criteriaKey)}
            >
              {svg}
              <span className='text-lg'>{label}</span>
            </button>
          ))}
        </div>

        {/*filter by tags*/}
        <div className='mb-4 lg:ml-6 xl:flex xl:ml-20'>
          <div className='w-8 inline-block fixed left-6'>
            <img src={Filter} alt='Fliter icon'></img>
          </div>
          <div className='w-32 -ml-6 inline-block sm:max-xl:-ml-6 xl:-ml-8'>
            <p className='text-left text-Primary/Light text-lg'>Filter by tags:</p>
          </div>
        </div>

        {/*tags*/}
        {/*tags*/}
        <div className='mr-2 flex-1 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
          {tags.map((tag) => (
            <button key={tag} className='w-24 my-2 mr-2 ' onClick={() => handleButtonClick(tag)}>
              <div className='flex flex-col'>
                <div
                  className={`${
                    selectedTags.includes(tag) ? 'bg-Primary/Light' : 'bg-white hover:bg-gray-300'
                  } rounded-3xl p-1 `}
                >
                  <p className='text-Primary/Dark'>{tag}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default TagList;

