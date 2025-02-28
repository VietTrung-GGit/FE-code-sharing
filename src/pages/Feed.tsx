import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Post, fetchPosts } from '../services/postService';
import LoadingSpinner from '../components/loadingAnimate';
import PostCreate from '../components/postCreate';
import { Link } from 'react-router-dom';
import NothingPost from '../components/nothingPost';
import { useTheme } from '../context/ThemeContext';
import { MdOutlineSearch } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa';

interface FeedProps {
  type: string;
}

const Feed: React.FC<FeedProps> = ({ type }) => {
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const quickNavRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); // To track the initial load
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownConfigOpen, setIsDropdownConfigOpen] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);

  const dropdownFilterRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const fetchAndUpdatePosts = async () => {
    setLoading(true);
    try {
      console.log('Debounced search term call:', debouncedSearchTerm);
      const tagsParam = searchParams.get('tags') || '';
      const postsResponse = await fetchPosts(
        page,
        6, // Limit: 6 posts per page
        (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
        (searchParams.get('criteria') as string) || 'date',
        debouncedSearchTerm,
        tagsParam.split(','),
        type as 'feed' | 'stored',
      );

      setHasMore(postsResponse.hasMore);
      setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
      setLoading(false);
      setFirstLoad(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchAndUpdatePosts();
    // }
  }, [type, debouncedSearchTerm, searchParams]);

  // useEffect(() => {
  //   // This effect will run only when debouncedSearchTerm changes
  //   console.log('Debounced search term:', debouncedSearchTerm);
  // }, [debouncedSearchTerm]);

  useEffect(() => {
    if (hasMore && !firstLoad) {
      console.log('2');

      fetchAndUpdatePosts();
    }
  }, [page]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/feed?${querySortParam}`);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };
  const [refId, setRefId] = useState<string>('');
  const handleCreate = () => {
    setRefId('');
    setShowPostCreate(true);
  };

  const handleShare = (postId?: string) => {
    if (postId) {
      setRefId(postId);
    }
    setShowPostCreate(true);
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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };

  const handleCloseTagModal = () => {
    setShowTaglistModal(false);
  };

  return (
    <div className='bg-[var(--background)] text-[var(--text)] relative min-h-screen flex flex-col w-full'>
      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-0 mx-6 sm:max-lg:mx-14 lg:mx-8'>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom border-2  border-Primary/Dark'
              : 'bg-[var(--surface)]'
          } h-18  px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl  sm:max-lg:rounded-3xl lg:mt-0 lg:border-t-0 lg:rounded-none lg:rounded-b-3xl
        border-solid box-border mb-3 text-center mt-28 `}
        >
          <div className='flex flex-row w-full items-center space-x-4 mx-4 mt-0'>
            <div className='text-3xl inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
              <MdOutlineSearch />
            </div>

            {/* Share Text Section */}
            <input
              className={`${
                theme === 'original'
                  ? 'bg-Background/Middle text-Primary/Light '
                  : 'bg-[var(--input)] text-[var(--text)]'
              } inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-md`}
              placeholder={`Search for posts...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            ></input>

            <button
              className='text-xl hover:bg-Background/Middle rounded-lg hover:bg-gray-300 hover:bg-opacity-20 block '
              onClick={() => setShowTaglistModal(!showTaglistModal)}
            >
              <FaFilter />
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
                      activeFilter={'Posts'} //change according to the button option, posts as default
                      initialCriteria={searchParams.get('criteria') as string}
                      initialOrder={
                        (searchParams.get('order') as 'ascending' | 'descending') || 'descending'
                      }
                      initialTags={searchParams.get('tags')?.split(',') || []}
                      handleClose={handleCloseTagModal}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <>
        <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
          {type == 'feed' && (
            <div
              className={`${
                theme === 'original'
                  ? 'bg-Background/Bottom border-2 border-Primary/Dark'
                  : 'bg-[var(--surface)] text-[var(--text)]'
              } w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-3 border-Primary/Dark rounded-3xl p-5 md:p-7 lg:p-8`}
            >
              <div className='flex flex-row w-full items-center space-x-4'>
                <div className='inline-block flex-shrink-0'>
                  <img
                    src={user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                    alt='Profile Icon'
                    className='w-[52px] h-[52px] rounded-full object-cover'
                  />
                </div>

                {/* Share Text Section */}
                <button
                  className={`bg-[var(--input)] text-gray-400
                inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap`}
                  onClick={handleCreate}
                >
                  <p className='text-left text-sm overflow-hidden'>Share your code...</p>
                </button>
              </div>
            </div>
          )}

          {showPostCreate && (
            <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
              <PostCreate
                closeModal={handleCloseModal}
                onPostCreated={refetchPosts}
                {...(refId ? { postRefId: refId } : {})}
              />
            </div>
          )}
        </div>
      </>

      {/* Show LoadingSpinner during the first load */}
      {firstLoad ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Show NothingPost only after the first load, no posts, and not loading */}
          {!loading && posts.length === 0 && <NothingPost />}

          {/* Display posts if available */}
          {posts.length > 0 && (
            <div id='posts-container' className={` mx-6 sm:max-lg:mx-14 lg:mx-10 `}>
              {posts.map((post) => (
                <div key={post._id} className='post'>
                  <PostBrief postData={post} shareAction={handleShare} />
                </div>
              ))}
            </div>
          )}

          {/* Show LoadingSpinner during additional data fetching */}
          {loading && <LoadingSpinner />}
        </>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className='h-12' />

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={type}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      <div ref={quickNavRef}>
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
};

export default Feed;

