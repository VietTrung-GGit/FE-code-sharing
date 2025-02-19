import { useState, useEffect } from 'react';
import { BiCalendar } from 'react-icons/bi';
import { AiFillHeart } from 'react-icons/ai';
import { BsFileCodeFill } from 'react-icons/bs';
import { HiUsers } from 'react-icons/hi';
import Filter from '../assets/filter.svg';
import Descend from '../assets/descending.svg';
import Ascend from '../assets/ascending.svg';
import { tags, tagColors } from '../utils/helpers';

function TagList({
  onFilterChange,
  feedShowTaglistModal,
  activeFilter,
  initialOrder,
  initialCriteria,
  initialTags,
  handleClose,
}: {
  feedShowTaglistModal: boolean;
  onFilterChange: (querySortParam: string) => void;
  activeFilter: string;
  initialOrder: 'ascending' | 'descending';
  initialCriteria: string;
  initialTags: string[];
  handleClose: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [order, setOrder] = useState<'ascending' | 'descending'>(initialOrder);
  const [criteriaPosts, setCriteriaPosts] = useState<'date' | 'likes' | 'comments'>('date');
  const [criteriaUsers, setCriteriaUsers] = useState<'datejoin' | 'likes' | 'followers'>(
    'followers',
  );
  const [criteriaGroupProject, setCriteriaGroupProject] = useState<
    'datecreate' | 'posts' | 'members'
  >('members');

  useEffect(() => {
    switch (activeFilter) {
      case 'Posts':
        if (
          initialCriteria === 'date' ||
          initialCriteria === 'likes' ||
          initialCriteria === 'comments'
        ) {
          setCriteriaPosts(initialCriteria);
        }
        break;

      case 'Users':
        if (
          initialCriteria === 'datejoin' ||
          initialCriteria === 'likes' ||
          initialCriteria === 'followers'
        ) {
          setCriteriaUsers(initialCriteria);
        }
        break;

      case 'Groups':
      case 'Projects':
        if (
          initialCriteria === 'datecreate' ||
          initialCriteria === 'posts' ||
          initialCriteria === 'members'
        ) {
          setCriteriaGroupProject(initialCriteria);
        }
        break;

      default:
        break;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const getSortBy = () => {
    switch (activeFilter) {
      case 'Posts':
        return criteriaPosts;
      case 'Users':
        return criteriaUsers;
      case 'Groups':
      case 'Projects':
        return criteriaGroupProject;
      default:
        return '';
    }
  };

  // Function to generate query parameter string
  const generateQueryParam = () => {
    const params = new URLSearchParams();
    if (selectedTags.length) params.append('tags', selectedTags.join(','));
    const sortBy = getSortBy();
    if (sortBy) params.append('criteria', sortBy);
    if (order) params.append('order', order);
    return params.toString();
  };

  // Function to handle filter submission
  const handleSubmit = () => {
    onFilterChange(generateQueryParam());
    handleClose();
  };

  // Function to reset filters to default
  const handleReset = () => {
    setSelectedTags([]);
    setCriteriaPosts('date');
    setCriteriaUsers('followers');
    setCriteriaGroupProject('members');
    setOrder('descending');
  };

  const buttonsPosts: {
    label: string;
    criteriaKey: 'date' | 'likes' | 'comments';
    svg: JSX.Element;
  }[] = [
    {
      label: 'Date',
      criteriaKey: 'date',
      svg: <BiCalendar className='text-2xl' />,
    },
    {
      label: 'Likes',
      criteriaKey: 'likes',
      svg: (
        <svg width='22' height='21' viewBox='0 0 22 21' xmlns='http://www.w3.org/2000/svg'>
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
          width='25'
          height='25'
          viewBox='0 0 25 25'
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

  const buttonsGroupProject: {
    label: string;
    criteriaKey: 'datecreate' | 'posts' | 'members';
    svg: JSX.Element;
  }[] = [
    {
      label: 'Members',
      criteriaKey: 'members',
      svg: <HiUsers className='text-2xl' />,
    },

    {
      label: 'Posts',
      criteriaKey: 'posts',
      svg: <BsFileCodeFill className='text-2xl' />,
    },
    {
      label: 'Date created',
      criteriaKey: 'datecreate',
      svg: <BiCalendar className='text-2xl' />,
    },
  ];

  const buttonsUsers: {
    label: string;
    criteriaKey: 'datejoin' | 'likes' | 'followers';
    svg: JSX.Element;
  }[] = [
    {
      label: 'Followers',
      criteriaKey: 'followers',
      svg: <AiFillHeart className='text-2xl' />,
    },
    {
      label: 'Likes',
      criteriaKey: 'likes',
      svg: (
        <svg width='22' height='21' viewBox='0 0 22 21' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M21.2173 10.122C21.6248 10.409 22 10.6937 22 11.6947C22 12.698 21.4697 13.104 20.9023 13.3863C21.1341 13.7673 21.2082 14.2249 21.1084 14.6603C20.9301 15.463 20.2006 16.086 19.5522 16.2703C19.8324 16.723 19.9204 17.1687 19.5869 17.717C19.1585 18.4053 18.7857 18.6667 17.1368 18.6667H10.4211C8.13305 18.6667 6.94737 17.3927 6.94737 16.3333V10.885C6.94737 8.015 10.3446 5.57667 10.3446 3.58167L10.0992 1.09667C10.0876 0.945 10.1177 0.574 10.2335 0.466667C10.4187 0.282333 10.9305 0 11.704 0C12.2088 0 12.5446 0.0956664 12.9406 0.287C14.2861 0.933333 14.6358 2.569 14.6358 3.885C14.6358 4.51733 13.6771 6.412 13.5474 7.06767C13.5474 7.06767 15.5552 6.61967 17.8987 6.60333C20.3558 6.58933 21.9491 7.04667 21.9491 8.568C21.9491 9.177 21.4419 9.78833 21.2173 10.122ZM1.38947 9.33333H3.24211C3.61062 9.33333 3.96403 9.48082 4.2246 9.74339C4.4852 10.0059 4.63158 10.362 4.63158 10.7333V19.6C4.63158 19.9712 4.4852 20.3273 4.2246 20.59C3.96403 20.8525 3.61062 21 3.24211 21H1.38947C1.02096 21 0.66755 20.8525 0.406977 20.59C0.146381 20.3273 0 19.9712 0 19.6V10.7333C0 10.362 0.146381 10.0059 0.406977 9.74339C0.66755 9.48082 1.02096 9.33333 1.38947 9.33333Z'
            fill='currentColor'
          />
        </svg>
      ),
    },
    {
      label: 'Date joined',
      criteriaKey: 'datejoin',
      svg: <BiCalendar className='text-2xl' />,
    },
  ];

  const handleButtonClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((selectedTag) => selectedTag !== tag) : [...prev, tag],
    );
  };

  // This function triggers when any filter or search query changes.

  useEffect(() => {
    // Trigger filter change whenever state changes
  }, [selectedTags, order, criteriaPosts, criteriaGroupProject, criteriaUsers, criteriaPosts]);

  return (
    <>
      <div
        className={`justify-center overflow-y-auto w-full h-full  ${activeFilter != 'Posts' ? 'lg:h-[60vh]' : 'lg:h-[90vh]'} lg:w-[50vw] bg-Background/Bottom bg-center bg-cover p-10  flex flex-col border-Primary/Dark border-solid box-border border-2 rounded-3xl  lg:mt-4  relative`}
      >
        <button
          onClick={handleClose}
          className='absolute top-6 right-12 text-white text-3xl hover:text-Primary/Light'
        >
          ×
        </button>
        {/* */}
        <p className=' text-white text-2xl font-semibold flex items-center gap-2'>
          <img src={Filter} alt='Filter icon' className='w-6 h-6' />
          {activeFilter} filter:
        </p>

        <br />
        <div className='flex flex-row justify-center mb-2'>
          {/*ASC/DESC BUTTONS*/}
          <div className='mb-4 flex flex-col space-y-4'>
            <p className='text-gray-200 text-xl'>Order:</p>

            <button className='w-[140px] ml-14' onClick={() => setOrder('descending')}>
              <div className='flex flex-row gap-1'>
                <div className='w-8 flex'>
                  <img src={Descend} alt='Descending icon'></img>
                </div>
                <div className='w-28 flex'>
                  <p
                    className={` text-left ${order === 'descending' ? 'text-Primary/Light' : 'text-white'} text-lg hover:text-Primary/Target`}
                  >
                    Descending
                  </p>
                </div>
              </div>
            </button>
            <button className='w-[140px] ml-14' onClick={() => setOrder('ascending')}>
              <div className='flex flex-row gap-1 '>
                <div className='w-8 flex'>
                  <img src={Ascend} alt='Ascending icon'></img>
                </div>
                <div className='w-28 flex'>
                  <p
                    className={`text-left ${order === 'ascending' ? 'text-Primary/Light hover:text-Primary/Target' : 'text-white hover:text-gray-300'} text-lg hover:text-Primary/Target`}
                  >
                    Ascending
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/*date,likes,comments*/}
          <div className='mb-2 flex flex-col space-y-4 ml-14'>
            <p className='text-gray-200 text-xl'>Criteria:</p>
            {activeFilter == 'Posts' && (
              <>
                {buttonsPosts.map(({ label, criteriaKey, svg }) => (
                  <button
                    key={criteriaKey}
                    className={`w-[140px] ml-14 mb-4 flex items-center space-x-2 ${
                      criteriaPosts === criteriaKey
                        ? 'text-Primary/Light hover:text-Primary/Target'
                        : 'text-white hover:text-gray-300'
                    }`}
                    onClick={() => setCriteriaPosts(criteriaKey)}
                  >
                    {svg}
                    <span className='text-lg'>{label}</span>
                  </button>
                ))}
              </>
            )}
            {activeFilter == 'Users' && (
              <>
                {buttonsUsers.map(({ label, criteriaKey, svg }) => (
                  <button
                    key={criteriaKey}
                    className={`w-[140px] ml-14 mb-4 flex items-center space-x-2 ${
                      criteriaUsers === criteriaKey
                        ? 'text-Primary/Light hover:text-Primary/Target'
                        : 'text-white hover:text-gray-300'
                    }`}
                    onClick={() => setCriteriaUsers(criteriaKey)}
                  >
                    {svg}
                    <span className='text-lg'>{label}</span>
                  </button>
                ))}
              </>
            )}

            {(activeFilter === 'Projects' || activeFilter === 'Groups') && (
              <>
                {buttonsGroupProject.map(({ label, criteriaKey, svg }) => (
                  <button
                    key={criteriaKey}
                    className={`w-[140px] ml-14 mb-4 flex items-center space-x-2 ${
                      criteriaGroupProject === criteriaKey
                        ? 'text-Primary/Light hover:text-Primary/Target'
                        : 'text-white hover:text-gray-300'
                    }`}
                    onClick={() => setCriteriaGroupProject(criteriaKey)}
                  >
                    {svg}
                    <span className='text-lg'>{label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
        {activeFilter == 'Posts' && (
          <>
            {/*filter by tags*/}
            <div className='mb-4 flex'>
              <div className='w-32 flex'>
                <p className='text-left text-gray-200 text-xl'>Tags:</p>
              </div>
            </div>

            {/*tags*/}

            <div className=' flex-1 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-Primary/Dark scrollbar-track-Background/Middle'>
              {tags.map((tag) => (
                <button key={tag} className='w-24 my-2 mr-6' onClick={() => handleButtonClick(tag)}>
                  <div className='flex flex-col'>
                    <div
                      className={`${
                        selectedTags.includes(tag)
                          ? `${tagColors[tag]}`
                          : 'bg-white hover:bg-gray-300'
                      } rounded-2xl p-1`}
                    >
                      <p className='text-Primary/Dark'>{tag}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {/* Submit and Reset Buttons */}
        <div className='flex justify-center items-center gap-10 mt-2 mr-8'>
          <button
            className='bg-Primary/Light hover:bg-Primary/Target  font-semibold text-Primary/Dark px-4 py-2 rounded-md'
            onClick={handleSubmit}
          >
            Apply filter
          </button>
          <button
            className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md'
            onClick={handleReset}
          >
            Reset filter
          </button>
        </div>
      </div>
    </>
  );
}

export default TagList;

