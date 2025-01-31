import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, fetchPosts } from '../services/postService';
import LoadingSpinner from '../components/loadingAnimate';
import PostCreate from '../components/postCreate';
import { Link } from 'react-router-dom';

type PostType = 'stored' | 'me' | undefined;

interface Params extends Record<string, string | undefined> {
  type: PostType;
}

function Feed() {
  // const { user } = useUser();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'taglist' | null>(null);
  const { type } = useParams<Params>();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const navigate = useNavigate();

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); // To track the initial load
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const debouncedSelectedTags = useDebounce(selectedTags, 800);
  const debouncedOrder = useDebounce<'ascending' | 'descending'>(order, 600);
  const debouncedCriteria = useDebounce<'date' | 'likes' | 'comments'>(criteria, 600);
  const fetchAndUpdatePosts = async () => {
    setLoading(true);
    try {
      console.log('Debounced search term call:', debouncedSearchTerm);
      const postsResponse = await fetchPosts(
        page,
        6, // Limit: 6 posts per page
        debouncedOrder,
        debouncedCriteria,
        debouncedSearchTerm,
        debouncedSelectedTags,
        type,
      );

      setHasMore(postsResponse.hasMore);
      setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
      setLoading(false);
      setFirstLoad(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  const validTypes: PostType[] = ['stored', 'me', undefined];
  useEffect(() => {
    if (!validTypes.includes(type)) {
      toast.error('Invalid page!');
      navigate('/feed');
    } else {
      setPage(1);
      setPosts([]);
      setHasMore(true);
      fetchAndUpdatePosts();
    }
  }, [type, debouncedSearchTerm, debouncedSelectedTags, debouncedOrder, debouncedCriteria]);

  // useEffect(() => {
  //   // This effect will run only when debouncedSearchTerm changes
  //   console.log('Debounced search term:', debouncedSearchTerm);
  // }, [debouncedSearchTerm]);

  useEffect(() => {
    // This effect will run only when debouncedSelectedTags changes
    console.log('Debounced selected tags:', debouncedSelectedTags);
  }, [debouncedSelectedTags]);

  // useEffect(() => {
  //   // This effect will run only when debouncedOrder changes
  //   console.log('Debounced order:', debouncedOrder);
  // }, [debouncedOrder]);

  // useEffect(() => {
  //   // This effect will run only when debouncedCriteria changes
  //   console.log('Debounced criteria:', debouncedCriteria);
  // }, [debouncedCriteria]);

  // useEffect(() => {
  //   // This effect will run only when type changes
  //   console.log('Type:', type);
  // }, [type]);

  // useEffect(() => {
  //   // This effect will run only when hasMore changes
  //   console.log('Has more:', hasMore);
  // }, [hasMore]);

  useEffect(() => {
    // This effect will run only on the first load
    console.log('First load:', firstLoad);
  }, [firstLoad]);

  useEffect(() => {
    // This effect will run only on the first load
    console.log('Page:', page);
  }, [page]);

  useEffect(() => {
    if (hasMore && !firstLoad) {
      console.log('2');

      fetchAndUpdatePosts();
    }
  }, [page]);

  const handleFilterChange = (filters: {
    selectedTags: string[];
    sortBy: string;
    order: string;
  }) => {
    setSelectedTags(filters.selectedTags);
    setOrder(filters.order as 'ascending' | 'descending');
    setCriteria(filters.sortBy as 'date' | 'likes' | 'comments');
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setFirstLoad(true);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore || firstLoad) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '300px',
      threshold: 0,
    });

    const currentObserver = observer.current;
    currentObserver.observe(sentinelRef.current);

    return () => {
      if (currentObserver && sentinelRef.current) {
        currentObserver.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, firstLoad]);

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleTagList = () => {
    setActiveComponent((prev) => (prev === 'taglist' ? null : 'taglist'));
  };

  const refetchPosts = () => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setFirstLoad(true);
    fetchAndUpdatePosts();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !sidebarRef.current?.contains(target) &&
        !tagListRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !tagListButtonRef.current?.contains(target)
      ) {
        setActiveComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  //// Toggle dropdown visibility
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowTaglistModal(false); // Close modal if clicked outside
      }
    };

    if (showTaglistModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTaglistModal]);

  //
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false);
  const { user } = useAuthUser();

  const handleCreate = () => {
    setShowPostCreate(true);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col w-full'>
      {type === 'me' && (
        <>
          <div className='mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
            <div className="bg-Background/Bottom bg-[url('assets/particle.svg')]  bg-center bg-cover rounded-3xl border-2 border-Primary/Dark border-solid box-border w-full lg:w-[calc(50vw-2.5rem)] xl:h-[435px] lg:h-[420px] sm:h-[450px] h-[600px] flex flex-col items-center relative">
              <div className=' w-full flex justify-end mt-4 -ml-2' ref={dropdownRef}>
                <button onClick={toggleDropdown} className='hover:text-gray-300 text-white'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <g clip-path='url(#clip0_765_1033)'>
                      <path
                        d='M12 18C13.6569 18 15 19.3431 15 21C15 22.6569 13.6569 24 12 24C10.3431 24 9 22.6569 9 21C9 19.3431 10.3431 18 12 18Z'
                        fill='currentColor'
                      />
                      <path
                        d='M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z'
                        fill='currentColor'
                      />
                      <path
                        d='M15 3C15 1.34314 13.6569 -7.24234e-08 12 0C10.3431 7.24235e-08 9 1.34315 9 3C9 4.65686 10.3431 6 12 6C13.6569 6 15 4.65686 15 3Z'
                        fill='currentColor'
                      />
                    </g>
                    <defs>
                      <clipPath id='clip0_765_1033'>
                        <rect width='24' height='24' fill='white' />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className='absolute right-56 mt-2 w-48 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
                    <ul className='py-1 my-3 ml-2'>
                      <li>
                        <button className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                          <svg className='w-5 h-5 stroke-current stroke-2' viewBox='0 0 24 24'>
                            <path
                              d='M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                            />
                            <polygon
                              points='12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                            />
                          </svg>
                          Edit profile
                        </button>
                      </li>
                      <li>
                        <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                          <svg
                            width='16'
                            height='18'
                            viewBox='0 0 16 18'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M11.5324 12.2427C12.0479 11.9487 12.6381 11.7814 13.2666 11.7814H13.2687C13.3326 11.7814 13.3625 11.7 13.3156 11.6548C12.662 11.0322 11.9154 10.5293 11.1063 10.1668C11.0978 10.1623 11.0892 10.16 11.0807 10.1555C12.4037 9.13568 13.2645 7.47814 13.2645 5.60804C13.2645 2.51005 10.9039 0 7.9915 0C5.07913 0 2.72068 2.51005 2.72068 5.60804C2.72068 7.47814 3.5814 9.13568 4.90656 10.1555C4.89804 10.16 4.88952 10.1623 4.881 10.1668C3.92867 10.5942 3.07434 11.207 2.33933 11.9894C1.60855 12.7637 1.02676 13.6815 0.626416 14.6917C0.232517 15.6809 0.0199339 16.7408 5.32749e-05 17.8146C-0.000515362 17.8387 0.00347296 17.8627 0.0117834 17.8852C0.0200938 17.9077 0.032558 17.9281 0.0484417 17.9454C0.0643254 17.9627 0.0833072 17.9764 0.104268 17.9858C0.12523 17.9952 0.147747 18 0.170492 18H1.44665C1.53826 18 1.61496 17.9209 1.61709 17.8236C1.6597 16.0779 2.31802 14.443 3.4834 13.2038C4.68712 11.9216 6.28925 11.2161 7.99364 11.2161C9.20162 11.2161 10.3606 11.5711 11.3598 12.2359C11.3855 12.253 11.4149 12.2627 11.4452 12.2639C11.4755 12.2651 11.5056 12.2578 11.5324 12.2427ZM7.99364 9.49749C7.01787 9.49749 6.09963 9.09271 5.40723 8.35779C5.06655 7.99713 4.79647 7.56849 4.61255 7.09656C4.42863 6.62464 4.33451 6.11875 4.33559 5.60804C4.33559 4.5701 4.71695 3.59322 5.40723 2.85829C6.0975 2.12337 7.01574 1.71859 7.99364 1.71859C8.97153 1.71859 9.88764 2.12337 10.58 2.85829C10.9207 3.21895 11.1908 3.64759 11.3747 4.11952C11.5586 4.59144 11.6528 5.09733 11.6517 5.60804C11.6517 6.64598 11.2703 7.62286 10.58 8.35779C9.88764 9.09271 8.9694 9.49749 7.99364 9.49749ZM15.8296 14.8794H10.7164C10.6227 14.8794 10.546 14.9608 10.546 15.0603V16.3266C10.546 16.4261 10.6227 16.5075 10.7164 16.5075H15.8296C15.9233 16.5075 16 16.4261 16 16.3266V15.0603C16 14.9608 15.9233 14.8794 15.8296 14.8794Z'
                              fill='#F14444'
                            />
                          </svg>
                          Delete account
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className='flex flex-row space-x-4 xsm:space-x-20 sm:space-x-0 xl:space-x-2 -mt-4 mb-44 xsm:mb-48 sm:mb-1 xl:-ml-5 lg:-ml-8 sm:-ml-8'>
                <div className='sm:-mt-10 lg:-mt-4 flex flex-col h-[380px] items-center'>
                  <img
                    src={
                      user?.avatar ||
                      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                    }
                    alt='Profile Icon'
                    className='w-32 h-32 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-full object-cover mt-8 mx-0 sm:mx-8 sm:mt-14 xl:mx-6 mb-5'
                  />
                  <div className='flex hidden sm:block lg:hidden'>
                    <button className='transition-colors duration-300 ease-in-out w-36 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Targetr'>
                      Follow
                    </button>
                  </div>
                  <div className='absolute bottom-8 xsm:left-0 -left-2 sm:static'>
                    <div className='flex justify-start ml-8 sm:ml-4 lg:ml-8 xl:ml-4 -mt-2 lg:mt-3 xl:-mt-2'>
                      <p className='text-Primary/Light text-lg sm:max-xl:text-lg xl:text-lg w-56 break-words'>
                        Contact via:
                      </p>
                    </div>

                    <div className='flex flex-row mt-4 gap-4 ml-8 sm:ml-4 lg:ml-8 xl:ml-4'>
                      <button className='text-white hover:text-gray-300'>
                        <svg
                          width='38'
                          height='38'
                          viewBox='0 0 38 38'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M6.53125 9.69775L19 17.7134L32.3594 9.69775M8.3125 28.9817C6.34499 28.9817 4.75 27.3867 4.75 25.4192V11.479C4.75 9.51149 6.34499 7.9165 8.3125 7.9165H29.6875C31.655 7.9165 33.25 9.51149 33.25 11.479V25.4192C33.25 27.3867 31.655 28.9817 29.6875 28.9817H8.3125Z'
                            stroke='currentColor'
                            stroke-width='3'
                            stroke-linecap='round'
                            stroke-linejoin='round'
                          />
                        </svg>
                      </button>
                      <button className='text-white hover:text-gray-300'>
                        <svg
                          width='32'
                          height='33'
                          viewBox='0 0 32 33'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M23.9997 2.75H19.9997C18.2316 2.75 16.5359 3.47433 15.2856 4.76364C14.0354 6.05295 13.333 7.80164 13.333 9.625V13.75H9.33301V19.25H13.333V30.25H18.6663V19.25H22.6663L23.9997 13.75H18.6663V9.625C18.6663 9.26033 18.8068 8.91059 19.0569 8.65273C19.3069 8.39487 19.6461 8.25 19.9997 8.25H23.9997V2.75Z'
                            stroke='currentColor'
                            stroke-width='3'
                            stroke-linecap='round'
                            stroke-linejoin='round'
                          />
                        </svg>
                      </button>

                      <button className='text-white hover:text-gray-300'>
                        <svg
                          width='33'
                          height='33'
                          viewBox='0 0 33 33'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g clip-path='url(#clip0_764_1167)'>
                            <path
                              d='M30.9923 8.8275C30.829 8.17494 30.4963 7.57704 30.028 7.09418C29.5596 6.61133 28.9721 6.26063 28.3248 6.0775C25.9598 5.5 16.4998 5.5 16.4998 5.5C16.4998 5.5 7.03981 5.5 4.67481 6.1325C4.02752 6.31563 3.44003 6.66633 2.97166 7.14918C2.50329 7.63204 2.17064 8.22994 2.00731 8.8825C1.57448 11.2826 1.36276 13.7174 1.37481 16.1563C1.35938 18.6134 1.57112 21.0668 2.00731 23.485C2.18738 24.1173 2.52748 24.6925 2.99476 25.1549C3.46203 25.6174 4.04069 25.9515 4.67481 26.125C7.03981 26.7575 16.4998 26.7575 16.4998 26.7575C16.4998 26.7575 25.9598 26.7575 28.3248 26.125C28.9721 25.9419 29.5596 25.5912 30.028 25.1083C30.4963 24.6255 30.829 24.0276 30.9923 23.375C31.4218 20.9929 31.6335 18.5767 31.6248 16.1563C31.6402 13.6991 31.4285 11.2457 30.9923 8.8275Z'
                              stroke='currentColor'
                              stroke-width='3'
                              stroke-linecap='round'
                              stroke-linejoin='round'
                            />
                            <path
                              d='M13.4061 20.6525L21.3123 16.1563L13.4061 11.66V20.6525Z'
                              stroke='currentColor'
                              stroke-width='3'
                              stroke-linecap='round'
                              stroke-linejoin='round'
                            />
                          </g>
                          <defs>
                            <clipPath id='clip0_764_1167'>
                              <rect width='33' height='33' fill='white' />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                      <button className='text-white hover:text-gray-300'>
                        <svg
                          width='33'
                          height='33'
                          viewBox='0 0 33 33'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <g clip-path='url(#clip0_764_1183)'>
                            <path
                              d='M12.375 26.1252C5.5 28.1877 5.5 22.6877 2.75 22.0002M22 30.2502V24.929C22.0516 24.2733 21.963 23.6142 21.7401 22.9954C21.5173 22.3767 21.1653 21.8124 20.7075 21.3402C25.025 20.859 29.5625 19.2227 29.5625 11.7152C29.5621 9.79548 28.8237 7.94937 27.5 6.55897C28.1268 4.87942 28.0825 3.02295 27.3762 1.37522C27.3762 1.37522 25.7538 0.893969 22 3.41022C18.8485 2.5561 15.5265 2.5561 12.375 3.41022C8.62125 0.893969 6.99875 1.37522 6.99875 1.37522C6.29252 3.02295 6.2482 4.87942 6.875 6.55897C5.54142 7.95968 4.80222 9.82248 4.8125 11.7565C4.8125 19.209 9.35 20.8452 13.6675 21.3815C13.2151 21.8489 12.8662 22.4064 12.6435 23.0176C12.4209 23.6288 12.3294 24.2801 12.375 24.929V30.2502'
                              stroke='currentColor'
                              stroke-width='3'
                              stroke-linecap='round'
                              stroke-linejoin='round'
                            />
                          </g>
                          <defs>
                            <clipPath id='clip0_764_1183'>
                              <rect width='33' height='33' fill='white' />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col space-y-4 mb-6 sm:mb-8 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0'>
                  <div className='flex flex-row sm:-mt-4 lg:mt-0'>
                    <div className='flex flex-col'>
                      <div className=''>
                        <p className='text-white font-semibold mt-6 text-3xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                          {user?.displayname || 'Display name'}
                        </p>
                      </div>
                      <div className='-mt-6 lg:-mt-8 xl:-mt-6'>
                        <p className='text-Primary/Light mt-8 text-lg lg:text-base xl:text-lg break-words'>
                          {user?.username || 'Username'}
                        </p>
                      </div>
                      <div className='flex sm:hidden xsm:mt-10 mt-8'>
                        <button className='transition-colors duration-300 ease-in-out w-36 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Targetr'>
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className='bg-Background/Middle sm:w-[40vw] lg:w-[21vw] xl:w-[24vw] h-[250px] sm:h-[285px] lg:h-[250px] xl:h-[245px] rounded-3xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static'>
                    <p className='text-Primary/Light p-4'>bio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
            <div
              className={`bg-Background/Bottom bg-[url('assets/particle.svg')]  bg-center bg-cover border-2 h-36  border-Primary/Dark px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  ${type === 'me' ? 'lg:mt-4 lg:rounded-3xl' : 'lg:mt-0 lg:border-t-0 lg:rounded-none lg:rounded-b-3xl'}
        border-solid box-border text-center mt-16 `}
            >
              <div className='flex flex-col items-center'>
                <div className='flex mx-2 mb-4'>
                  <p className='text-white xsm:text-2xl text-xl font-semibold text-center break-words'>
                    {user?.username || 'Username'}'s Dashboard
                  </p>
                </div>
                <div className='flex flex-row gap-4 xsm:gap-8 sm:gap-20 '>
                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>1000</p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Posts
                    </p>
                  </div>

                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>321K</p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Likes
                    </p>
                  </div>

                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>123K</p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Followers
                    </p>
                  </div>
                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>2</p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Following
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
        <div
          className={`bg-Background/Bottom border-2 h-18  border-Primary/Dark px-6 py-4 w-full flex items-center justify-between rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  ${type === 'me' ? 'lg:mt-4 lg:rounded-3xl' : 'lg:mt-0 lg:border-t-0 lg:rounded-none lg:rounded-b-3xl'}
        border-solid box-border mb-5 text-center mt-28 `}
        >
          <div className='flex flex-row w-full items-center space-x-4 mx-4'>
            <div className='inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
              <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
            </div>

            {/* Share Text Section */}
            <input
              className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-Primary/Light text-l'
              placeholder='Search...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            ></input>
            {type === 'me' && (
              <button
                className='hover:bg-Background/Middle rounded-lg hover:bg-gray-300 hover:bg-opacity-20 hidden lg:block '
                onClick={() => setShowTaglistModal(!showTaglistModal)}
              >
                <img src={Filter} alt='Filter Icon' className='w-9 h-9 rounded-full object-cover' />
              </button>
            )}
            {showTaglistModal && type === 'me' && (
              <div
                className={`fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
              >
                <div ref={tagListRef}>
                  <div ref={modalRef}>
                    <TagList
                      isOpen={activeComponent === 'taglist'}
                      onClose={() => setActiveComponent(null)}
                      onFilterChange={handleFilterChange}
                      feedShowTaglistModal={showTaglistModal}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showPostCreate && (
          <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
            <PostCreate closeModal={handleCloseModal} onPostCreated={refetchPosts} />
          </div>
        )}
      </div>
      {type !== 'stored' && (
        <div className='mb-5'>
          <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
            <div
              className='bg-Background/Bottom border-2 h-40  border-Primary/Dark px-6 py-4 w-full flex items-center justify-between rounded-3xl shadow-md lg:w-1/2 sm:max-lg:rounded-3xl lg:rounded-b-3xl lg:mt-0
        border-solid box-border border-2 mb-5 rounded-3xl text-center mt-0 p-14 mt-6
        sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12'
            >
              <div className='flex flex-row w-full items-center space-x-4'>
                <div className='inline-block flex-shrink-0'>
                  <img
                    src={
                      user?.avatar ||
                      'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                    }
                    alt='Profile Icon'
                    className='w-16 h-16 rounded-full object-cover'
                  />
                </div>

                {/* Share Text Section */}
                <button
                  className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap'
                  onClick={handleCreate}
                >
                  <p className='text-left text-Primary/Light text-l overflow-hidden'>
                    Share your code...
                  </p>
                </button>
              </div>
            </div>

            {showPostCreate && (
              <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
                <PostCreate closeModal={handleCloseModal} onPostCreated={refetchPosts} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show LoadingSpinner during the first load */}
      {firstLoad ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Show NothingPost only after the first load, no posts, and not loading */}
          {!loading && posts.length === 0 && (
            <div className='mb-5'>
              <div className='flex justify-center mx-0 lg:mx-6'>
                <div
                  className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-8 flex bg-Background/Bottom text-center p-12 w-full h-40 border-Primary/Dark border-solid box-border border-2 rounded-3xl
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-1/2 mt-4`}
                >
                  <div className='h-auto'>
                    <p className='text-left text-white text-l -mt-2 xsmnopost:mt-2 sm:mt-2 xl:mt-4'>
                      Nothing here... Go explore{' '}
                      <Link to='/feed' className='text-Accent/Target cursor-pointer inline'>
                        Codemunity
                      </Link>{' '}
                      or{' '}
                      <Link to='/feed/me' className='text-Primary/Light cursor-pointer inline'>
                        share your own code
                      </Link>{' '}
                      !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display posts if available */}
          {posts.length > 0 && (
            <div
              id='posts-container'
              className={` mx-6 sm:max-lg:mx-14 lg:mx-8 ${type === 'stored' ? 'mt-28 sm:max-lg:mt-28 lg:mt-0' : ''}`}
            >
              {posts.map((post) => (
                <div key={post._id} className='post'>
                  <PostBrief postData={post} />
                </div>
              ))}
            </div>
          )}

          {/* Show LoadingSpinner during additional data fetching */}
          {loading && <LoadingSpinner />}
        </>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      {type === 'me' && (
        <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
          <div className="bg-Background/Bottom bg-[url('assets/particle.svg')]  bg-cover rounded-3xl border-2 border-Primary/Dark lg:w-[22vw] xl:w-[19vw] lg:h-[420px] xl:h-[425px] mt-4 ml-[3rem] ">
            <div className='flex flex-col'>
              <div className='flex justify-center mx-2'>
                <p className='text-white text-2xl font-semibold mt-16 text-center break-words'>
                  {user?.username || 'Username'}'s Dashboard
                </p>
              </div>
              <br />
              <div className='flex flex-row justify-center gap-8 mb-5'>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>1000</p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Posts</p>
                </div>

                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>321K</p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Likes</p>
                </div>
              </div>
              <div className='flex flex-row justify-center gap-8 mb-5'>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>123K</p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Followers</p>
                </div>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>2</p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Following</p>
                </div>
              </div>
            </div>
            <div className='flex justify-center lg:-mt-4 xl:ml-0'>
              <button className='transition-colors duration-300 ease-in-out w-44 h-10 rounded-xl bg-Accent/Target text-lg text-white m-4 hover:bg-white hover:text-Accent/Target '>
                Follow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={type}
          onClose={() => setActiveComponent(null)}
        />
      </div>
      {/* TagList */}

      <div ref={tagListRef} className={`flex ${type === 'me' ? 'lg:invisible' : ''}`}>
        <TagList
          isOpen={activeComponent === 'taglist'}
          onClose={() => setActiveComponent(null)}
          onFilterChange={handleFilterChange}
          feedShowTaglistModal={false}
        />
      </div>

      {/* CollapseMenu */}
      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        onToggleTagList={toggleTagList}
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListOpen={activeComponent === 'taglist'}
        isTagListVisible={true}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />
    </div>
  );
}

export default Feed;

