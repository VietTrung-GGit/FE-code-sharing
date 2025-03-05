import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
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

function ProfileTemp() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); // To track the initial load
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');

  const { user } = useAuthUser();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'taglist' | null>(null);
  const { type } = useParams<Params>();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

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
  useEffect(() => {
    // This effect will run only when debouncedSelectedTags changes
    console.log('Debounced selected tags:', debouncedSelectedTags);
  }, [debouncedSelectedTags]);

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

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      <div className='flex flex-row mt-20 ml-36 justify-center space-x-12'>
        <div className='bg-Background/Bottom rounded-xl border-2 border-Primary/Dark w-3/5 ml-40 flex flex-row'>
          <div className='flex flex-col h-[450px]'>
            <img
              src={user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
              alt='Profile Icon'
              className='h-20 w-20 lg:h-56 lg:w-56 rounded-full object-cover mx-10 mt-10'
            />
            <div className='flex justify-center'>
              <button className='transition-colors duration-300 ease-in-out w-32 h-8 rounded-xl bg-Accent/Target text-lg text-white m-6 hover:bg-white hover:text-Accent/Target '>
                Follow
              </button>
            </div>
            <div className='flex justify-start ml-10'>
              <p className='text-text-[var(--text-title)] text-lg sm:max-xl:text-lg xl:text-base w-56 break-words'>
                Contact via:
              </p>
            </div>
          </div>

          <div className='flex flex-col space-y-10 w-96'>
            <div className='flex flex-row mt-2'>
              <div>
                <p className='text-white font-semibold mt-6 text-lg sm:max-xl:text-lg xl:text-3xl w-44 break-words'>
                  {user?.displayname || 'Display name'}
                </p>
              </div>
              <div>
                <p className='text-text-[var(--text-title)] mt-8 text-lg sm:max-xl:text-lg xl:text-lg w-28 break-words'>
                  {user?.username || 'Username'}
                </p>
              </div>
              <div className='ml-44 mt-2'>
                <button>
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
                        fill='white'
                      />
                      <path
                        d='M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z'
                        fill='white'
                      />
                      <path
                        d='M15 3C15 1.34314 13.6569 -7.24234e-08 12 0C10.3431 7.24235e-08 9 1.34315 9 3C9 4.65686 10.3431 6 12 6C13.6569 6 15 4.65686 15 3Z'
                        fill='white'
                      />
                    </g>
                    <defs>
                      <clipPath id='clip0_765_1033'>
                        <rect width='24' height='24' fill='white' />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
            <div className='bg-Background/Middle w-[480px] h-72 rounded-3xl'>
              <p className='text-text-[var(--text-title)] p-4'>bio</p>
            </div>
          </div>
        </div>
        <div className=' flex flex-col'>
          <div className='bg-Background/Bottom rounded-xl border-2 border-Primary/Dark w-56 h-[450px]'>
            <div className='flex flex-col'>
              <p className='text-white text-2xl font-semibold flex justify-center mt-8'>
                Dashboard
              </p>
              <br />
              <p className='text-white text-3xl font-semibold flex justify-center'>1000</p>
              <p className='text-text-[var(--text-title)] text-xl flex justify-center'>Posts</p>
              <br />
              <p className='text-white text-3xl font-semibold flex justify-center'>321K</p>
              <p className='text-text-[var(--text-title)] text-xl flex justify-center'>Likes</p>
              <br />
              <p className='text-white text-3xl font-semibold flex justify-center'>123K</p>
              <p className='text-text-[var(--text-title)] text-xl flex justify-center'>Followers</p>
              <br />
              <p className='text-white text-3xl font-semibold flex justify-center'>2</p>
              <p className='text-text-[var(--text-title)] text-xl flex justify-center'>Following</p>
            </div>
          </div>
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
                      <Link
                        to='/feed/me'
                        className='text-text-[var(--text-title)] cursor-pointer inline'
                      >
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
              className={` mx-0 sm:max-lg:mx-0 lg:mx-8 ${type === 'stored' ? 'mt-28 sm:max-lg:mt-28 lg:mt-0' : ''}`}
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

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state='profiletemp'
          onClose={() => setActiveComponent(null)}
        />
      </div>
      {/* TagList */}
      <div ref={tagListRef}>
        <TagList
          isOpen={activeComponent === 'taglist'}
          onClose={() => setActiveComponent(null)}
          onFilterChange={handleFilterChange}
        />
      </div>
      {/* CollapseMenu */}
      <CollapseMenu
        onToggleSidebar={toggleSidebar}
        onToggleTagList={toggleTagList}
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListOpen={activeComponent === 'taglist'}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />
    </div>
  );
}
export default ProfileTemp;

