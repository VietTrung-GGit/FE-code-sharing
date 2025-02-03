import { useState, useEffect, useRef } from 'react';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
import UserBrief from '../components/userBrief';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
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

function Home() {
  // const { user } = useUser();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [activeHomeDashboard, setActiveHomeDashboard] = useState<
    'posts' | 'following' | 'groups' | 'projects' | null
  >('posts');
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
          <div className='bg-Background/Bottom bg-center bg-cover rounded-3xl border-2 border-Primary/Dark border-solid box-border w-full lg:w-[calc(50vw-5rem)] xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] flex flex-col items-center relative'>
            <div className=' w-full flex justify-end mt-4 -ml-2' ref={dropdownConfigRef}>
              <button
                onClick={toggleDropdownConfig}
                className='hover:text-gray-300 text-white text-3xl'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div className='absolute right-4 top-14 w-48 bg-Background/Bottom border rounded-3xl border-2 border-Primary/Dark shadow-lg z-10'>
                  <ul className='py-1 my-3 ml-2'>
                    <li>
                      <button className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                        <BiSolidEdit className='text-2xl' />
                        Edit profile
                      </button>
                    </li>
                    <li>
                      <button className='block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                        <AiOutlineUserDelete className='text-2xl' />
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
                <div className='absolute flex items-center bottom-8 xsm:left-0 -left-2 sm:static space-x-2'>
                  <IoIosMail className='text-Primary/Light text-3xl' />

                  <div className='flex flex-row '>
                    <a href='mailto:example@gmail.com' className='text-white '>
                      example@gmail.com
                    </a>
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
                        @{user?.username || 'Username'}
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
                  <p className='text-Primary/Light p-4'>bio</p>
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

        <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
          <div className='flex flex-row justify-center gap-28 w-1/2'>
            <button
              className={`${activeHomeDashboard === 'posts' ? 'text-gray-500' : 'text-white'} text-xl`}
              onClick={() => setActiveHomeDashboard('posts')}
            >
              Posts
            </button>
            <button
              className={`${activeHomeDashboard === 'following' ? 'text-gray-500' : 'text-white'} text-xl`}
              onClick={() => setActiveHomeDashboard('following')}
            >
              Following
            </button>
            <button
              className={`${activeHomeDashboard === 'groups' ? 'text-gray-500' : 'text-white'} text-xl`}
              onClick={() => setActiveHomeDashboard('groups')}
            >
              Groups
            </button>
            <button
              className={`${activeHomeDashboard === 'projects' ? 'text-gray-500' : 'text-white'} text-xl`}
              onClick={() => setActiveHomeDashboard('projects')}
            >
              Projects
            </button>
          </div>
        </div>
        <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
          <p className='text-xl text-white'>Posts (0)</p>
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
              placeholder='Search...'
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
      {activeHomeDashboard === 'posts' && (
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
      {activeHomeDashboard === 'following' && (
        <div className='mb-5'>
          <UserBrief />
        </div>
      )}
      {activeHomeDashboard === 'groups' && (
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
                    className='w-28 h-28 rounded-full object-cover'
                  />
                </div>
                <div className='flex flex-col'>
                  <div className=''>
                    <p className='text-white font-semibold mt-6 text-2xl '>Group name</p>
                  </div>
                  <div className='flex flex-row'>
                    <img
                      src={
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      }
                      alt='Profile Icon'
                      className='w-8 h-8 rounded-full object-cover'
                    />
                  </div>
                </div>
                <button className='transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl bg-gray-500 text-lg text-white m-4 hover:bg-white hover:text-Accent/Target '>
                  Joined
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeHomeDashboard === 'projects' && (
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
                    className='w-28 h-28 rounded-full object-cover'
                  />
                </div>
                <div className='flex flex-col'>
                  <div className=''>
                    <p className='text-white font-semibold mt-6 text-2xl '>
                      Project name <span className='text-2xl text-gray-500'>from Group name</span>
                    </p>
                  </div>
                  <div className='flex flex-row'>
                    <img
                      src={
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      }
                      alt='Profile Icon'
                      className='w-8 h-8 rounded-full object-cover'
                    />
                  </div>
                </div>
                <button className='transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl bg-gray-500 text-lg text-white m-4 hover:bg-white hover:text-Accent/Target '>
                  Joined
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        <div className='bg-Background/Bottom bg-cover rounded-3xl border-2 border-Primary/Dark lg:w-[22vw] xl:w-[19vw] lg:h-[420px] xl:h-[425px] mt-4 ml-[3rem] '>
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

export default Home;

