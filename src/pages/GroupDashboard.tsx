import { useState, useEffect, useRef } from 'react';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { MdOutlinePublicOff, MdOutlinePublic } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
import UserBrief from '../components/userBrief';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import GroupBrief from '../components/groupBrief';
import ProjectBrief from '../components/projectBrief';
import QuickNav from '../components/quickNav';
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

function GroupDashboard() {
  // const { user } = useUser();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [activeDashboard, setActiveDashboard] = useState<
    'Posts' | 'Members' | 'My posts' | 'Projects' | 'Pending posts'
  >('Posts');
  const { type } = useParams<Params>();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);
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
  const [isDropdownConfigOpen, setIsDropdownConfigOpen] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);
  const dropdownFilterRef = useRef<HTMLDivElement>(null);
  const [buttonText, setButtonText] = useState<'Follow' | 'Unfollow' | 'Followed' | null>(null);
  const [buttonClicked, setButtonClicked] = useState(false);

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

  {
    /*} const toggleTagList = () => {
    setActiveComponent((prev) => (prev === 'taglist' ? null : 'taglist'));
  };*/
  }
  const toggleQuickNav = () => {
    setActiveComponent((prev) => (prev === 'quicknav' ? null : 'quicknav'));
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
        !quickNavRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !quickNavButtonRef.current?.contains(target)
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
  const toggleDropdownConfig = () => setIsDropdownConfigOpen((prev) => !prev);
  const toggleDropdownFilter = () => setIsDropdownFilterOpen((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownConfigRef.current && !dropdownConfigRef.current.contains(event.target as Node)) {
        setIsDropdownConfigOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownFilterRef.current && !dropdownFilterRef.current.contains(event.target as Node)) {
        setIsDropdownFilterOpen(false);
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
      <>
        <div className='mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
          <div className='bg-Background/Bottom bg-center bg-cover rounded-3xl border-2 border-Primary/Dark border-solid box-border w-full lg:w-[calc(50vw-3rem)] xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] flex flex-col items-center relative'>
            <div className=' w-full flex justify-end mt-4 mr-20' ref={dropdownConfigRef}>
              <button
                onClick={toggleDropdownConfig}
                className='hover:text-gray-300 text-white text-3xl'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div className='absolute right-4 top-14 w-52 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
                  <ul className='py-1 my-3 ml-2'>
                    <li>
                      <button className='block px-3 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                        <BiSolidEdit className='text-2xl' />
                        Edit group profile
                      </button>
                    </li>
                    <li>
                      <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                        <svg
                          width='19'
                          height='20'
                          viewBox='0 0 19 20'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M18.8031 16.8001H13.2902C13.1819 16.8001 13.0933 16.8901 13.0933 17.0001V18.2001C13.0933 18.3101 13.1819 18.4 13.2902 18.4H18.8031C18.9114 18.4 19 18.3101 19 18.2001V17.0001C19 16.8901 18.9114 16.8001 18.8031 16.8001ZM6.14059 9.96029C6.11844 9.7428 6.10613 9.52281 6.10613 9.30031C6.10613 8.90283 6.14305 8.51534 6.21196 8.13785C6.22919 8.04785 6.18242 7.95535 6.10121 7.91786C5.76649 7.76536 5.45885 7.55537 5.19305 7.29037C4.87985 6.9819 4.63338 6.6105 4.46939 6.19986C4.3054 5.78923 4.22747 5.34838 4.24059 4.90544C4.26274 4.10297 4.58023 3.34049 5.13398 2.76551C5.74188 2.13302 6.55898 1.78803 7.42776 1.79803C8.21286 1.80553 8.97089 2.11302 9.54433 2.65801C9.73876 2.843 9.90612 3.048 10.0464 3.26799C10.0956 3.34549 10.1916 3.37799 10.2753 3.34799C10.7084 3.19549 11.1662 3.088 11.6363 3.038C11.7741 3.023 11.8529 2.873 11.7913 2.74801C10.9915 1.14055 9.35728 0.0305857 7.46714 0.000586576C4.73774 -0.0419122 2.46365 2.23052 2.46365 4.99794C2.46365 6.56789 3.17492 7.96785 4.28981 8.88533C3.50717 9.25282 2.78606 9.7603 2.16094 10.3953C0.812235 11.7627 0.0492842 13.5677 6.15431e-05 15.4951C-0.000595345 15.5218 0.00401196 15.5484 0.0136121 15.5732C0.0232123 15.598 0.037611 15.6207 0.0559598 15.6398C0.0743086 15.6589 0.0962362 15.6741 0.120451 15.6844C0.144665 15.6948 0.170677 15.7001 0.196952 15.7001H1.57765C1.68348 15.7001 1.77208 15.6151 1.77454 15.5076C1.8213 14.0577 2.39966 12.7002 3.41611 11.6702C4.13968 10.9353 5.02569 10.4253 5.99292 10.1778C6.0889 10.1528 6.15289 10.0603 6.14059 9.96029ZM17.228 9.30031C17.228 6.56539 15.0646 4.34296 12.382 4.30046C9.65508 4.25796 7.38346 6.5304 7.38346 9.30031C7.38346 10.8703 8.09719 12.2702 9.20962 13.1877C8.41887 13.56 7.69902 14.0712 7.0832 14.6977C5.7345 16.0651 4.97155 17.8701 4.92233 19.795C4.92167 19.8217 4.92628 19.8482 4.93588 19.8731C4.94548 19.8979 4.95987 19.9206 4.97822 19.9397C4.99657 19.9588 5.0185 19.974 5.04271 19.9843C5.06693 19.9947 5.09294 20 5.11922 20H6.49745C6.60328 20 6.69188 19.915 6.69434 19.8075C6.7411 18.3575 7.31947 17.0001 8.33592 15.9701C9.39666 14.8927 10.8044 14.3002 12.3057 14.3002C15.0228 14.3002 17.228 12.0627 17.228 9.30031ZM14.533 11.5627C13.9375 12.1677 13.1474 12.5002 12.3057 12.5002C11.464 12.5002 10.674 12.1677 10.0784 11.5627C9.78119 11.2624 9.54635 10.9046 9.38782 10.5104C9.22928 10.1161 9.15027 9.69361 9.15547 9.26782C9.16286 8.44784 9.48526 7.65536 10.0489 7.06788C10.6395 6.4529 11.4296 6.11041 12.2737 6.10041C13.1081 6.09291 13.9178 6.4229 14.5134 7.01538C15.1237 7.62286 15.4584 8.43534 15.4584 9.30031C15.456 10.1553 15.1286 10.9578 14.533 11.5627Z'
                            fill='#F14444'
                          />
                        </svg>
                        Delete group
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className='flex flex-row space-x-4 xsm:space-x-20 sm:space-x-0 xl:space-x-2 -mt-4 mb-44 xsm:mb-48 sm:mb-1 xl:-ml-5 lg:-ml-8 sm:-ml-8'>
              <div className='sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
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
                <div className='absolute flex items-center bottom-8 xsm:left-0 -left-2 sm:static space-x-2'>
                  <div className='flex flex-row '>
                    <p className='text-white text-lg'>addmembers here</p>
                  </div>
                </div>
              </div>

              <div className='flex flex-col space-y-4 mb-6 sm:mb-8 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0'>
                <div className='flex flex-row sm:-mt-4 lg:mt-0'>
                  <div className='flex flex-col'>
                    <div className=''>
                      <p className='text-white font-semibold mt-6 text-3xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                        Groupname
                      </p>
                    </div>

                    <div className='flex sm:hidden xsm:mt-10 mt-8'>
                      <button className='transition-colors duration-300 ease-in-out w-36 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Targetr'>
                        Follow
                      </button>
                    </div>
                  </div>
                </div>

                <div className='bg-Background/Middle sm:w-[40vw] lg:w-[21vw] xl:w-[24vw] h-full rounded-3xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static'>
                  <p className='text-Primary/Light p-4'>team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
          <div
            className={`bg-Background/Bottom bg-center bg-cover border-2 h-36  border-Primary/Dark px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-16 `}
          >
            <div className='flex flex-col items-center'>
              <div className='flex mx-2 mb-4'>
                <p className='text-white xsm:text-2xl text-xl font-semibold text-center break-words'>
                  Groupname's Dashboard
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

        <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
          <div className='flex flex-row justify-center gap-20 w-1/2'>
            <button
              className={`${activeDashboard === 'Posts' ? 'text-gray-500' : 'text-white'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => setActiveDashboard('Posts')}
            >
              Posts
            </button>
            <button
              className={`${activeDashboard === 'Projects' ? 'text-gray-500' : 'text-white'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => setActiveDashboard('Projects')}
            >
              Projects
            </button>
            <button
              className={`${activeDashboard === 'Members' ? 'text-gray-500' : 'text-white'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => setActiveDashboard('Members')}
            >
              Members
            </button>
            <button
              className={`${activeDashboard === 'My posts' ? 'text-gray-500' : 'text-white'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => setActiveDashboard('My posts')}
            >
              My posts
            </button>
            <button
              className={`${activeDashboard === 'Pending posts' ? 'text-gray-500' : 'text-white'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => setActiveDashboard('Pending posts')}
            >
              Pending posts
            </button>
          </div>
        </div>
        <div className='flex justify-start -mt-10 sm:max-lg:-mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5 relative'>
          <div className=' absolute left-96'>
            <p className='text-2xl font-semibold text-white'>{activeDashboard} (0)</p>
          </div>
        </div>
      </>

      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
        <div
          className={`bg-Background/Bottom border-2 h-18  border-Primary/Dark px-6 py-4 w-full flex items-center justify-between rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl lg:mt-4 lg:rounded-3xl
        border-solid box-border mb-5 text-center mt-28 `}
        >
          <div className='flex flex-row w-full items-center space-x-4 mx-4'>
            <div className='inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
              <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
            </div>

            {/* Share Text Section */}
            <input
              className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-Primary/Light text-l'
              placeholder={`Search for ${activeDashboard.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            ></input>

            <button
              className='hover:bg-Background/Middle rounded-lg hover:bg-gray-300 hover:bg-opacity-20 hidden lg:block '
              onClick={() => setShowTaglistModal(!showTaglistModal)}
            >
              <img src={Filter} alt='Filter Icon' className='w-9 h-9 rounded-full object-cover' />
            </button>

            {showTaglistModal && (
              <div
                className={`fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
              >
                <div ref={tagListRef}>
                  <div ref={modalRef}>
                    <TagList
                      onFilterChange={handleFilterChange}
                      feedShowTaglistModal={showTaglistModal}
                      activeFilter={activeDashboard}
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
      {activeDashboard === 'Posts' && (
        <>
          <div className='mb-5'>
            <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
              <div
                className='bg-Background/Bottom border-2 h-40  border-Primary/Dark px-6 py-4 w-full flex items-center justify-between rounded-3xl shadow-md lg:w-1/2 sm:max-lg:rounded-3xl lg:rounded-b-3xl lg:mt-0
        border-solid box-border mb-5 rounded-3xl text-center mt-0 p-14 mt-6
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
        </>
      )}
      {/*
      {activeDashboard === 'users' && (
        <div className='mb-5'>
          <UserBrief />
        </div>
      )}
      {activeDashboard === 'groups' && (
        <div className='mb-5'>
          <GroupBrief />
        </div>
      )}
      {activeDashboard === 'projects' && (
        <div className='mb-5'>
          <ProjectBrief />
        </div>
      )}
    */}
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        <div className='bg-Background/Bottom bg-cover rounded-3xl border-2 border-Primary/Dark lg:w-[22vw] xl:w-[19vw] lg:h-[420px] xl:h-[400px] mt-4 ml-[3rem] '>
          <div className='flex flex-col '>
            <div className='flex justify-center mx-2'>
              <p className='text-white text-2xl font-semibold mt-6 text-center break-words'>
                Groupname's Dashboard
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
                <p className='text-Primary/Light text-xl flex justify-center'>Projects</p>
              </div>

              <div className='flex flex-col'>
                <p className='text-white text-xl flex justify-center'>123K</p>
                <p className='text-Primary/Light text-xl flex justify-center'>Members</p>
              </div>
            </div>
            <div className='flex justify-center items-center flex-row mx-6 gap-3'>
              <MdOutlinePublicOff className='text-4xl text-white' />
              <p className='text-lg text-white'>Content only visible to members</p>
            </div>
            <div className='flex justify-center items-center flex-row mx-6 gap-3'>
              <TbFlag className='text-5xl text-white' />
              <p className='text-lg text-white'>Member's posts need approval from admins</p>
            </div>
          </div>
          <div className='flex justify-center xl:ml-0'>
            <button className='transition-colors duration-300 ease-in-out w-44 h-8 rounded-xl bg-Accent/Target text-lg text-white m-4 hover:bg-white hover:text-Accent/Target '>
              Follow
            </button>
          </div>
          <div className='flex justify-center xl:ml-0 -mt-4'>
            <button className='transition-colors duration-300 ease-in-out w-44 h-8 rounded-xl bg-red-500 text-lg text-white m-4 hover:bg-white hover:text-red-500 '>
              Leave
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={type}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {/* TagList 

      <div ref={tagListRef} className={`flex lg:invisible`}>
        <TagList
          isOpen={activeComponent === 'taglist'}
          onClose={() => setActiveComponent(null)}
          onFilterChange={handleFilterChange}
          feedShowTaglistModal={false}
        />
      </div>*/}
      {/* TagList */}

      <div className='flex lg:invisible'>
        <QuickNav
          isOpen={activeComponent === 'quicknav'}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {/* CollapseMenu */}
      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        onToggleQuickNav={toggleQuickNav}
        isSidebarOpen={activeComponent === 'sidebar'}
        isQuickNavOpen={activeComponent === 'quicknav'}
        sidebarButtonRef={sidebarButtonRef}
        quickNavButtonRef={quickNavButtonRef}
      />
    </div>
  );
}

export default GroupDashboard;

