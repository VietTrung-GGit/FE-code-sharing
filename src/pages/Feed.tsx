import { useState, useEffect, useRef } from 'react';
import ButtonShare from '../components/buttonShare';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import NothingPost from '../components/nothingPost';
import PostBrief from '../components/postBrief';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Post, fetchPosts } from '../services/postService';
import LoadingSpinner from '../components/loadingSpinner';
import PostCreate from '../components/postCreate';
import { getUserFullData } from '../services/userService';
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
  const navigate = useNavigate();

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); // To track the initial load
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');

  useEffect(() => {
    const validTypes: PostType[] = ['stored', 'me', undefined];
    if (!validTypes.includes(type)) {
      toast.error('Invalid page!');
      navigate('/feed');
    } else {
      setPage(1);
      setPosts([]);
      setHasMore(true);
    }
  }, [type, navigate]);

  useEffect(() => {
    const fetchAndUpdatePosts = async () => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const postsResponse = await fetchPosts(
          page,
          6, // Limit: 6 posts per page
          order,
          criteria,
          searchTerm,
          selectedTags,
          type,
        );

        if (postsResponse.posts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
          setHasMore(postsResponse.hasMore);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setFirstLoad(false); // Mark first load as complete
      }
    };

    fetchAndUpdatePosts();
  }, [page, order, criteria, searchTerm, selectedTags, type, hasMore]);

  const handleFilterChange = (filters: {
    selectedTags: string[];
    sortBy: string;
    order: string;
    searchQuery: string;
  }) => {
    setSelectedTags(filters.selectedTags);
    setSearchTerm(filters.searchQuery);
    setOrder(filters.order as 'ascending' | 'descending');
    setCriteria(filters.sortBy as 'date' | 'likes' | 'comments');
    setPage(1);
    setPosts([]);
    setHasMore(true);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore || firstLoad) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        console.log('+1');
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

  const [showPostCreate, setShowPostCreate] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541',
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserFullData();
        setAvatarUrl(userData.avatar);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleCreate = () => {
    setShowPostCreate(true);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {type !== 'stored' && (
        <div className='mb-6'>
          <div className='flex justify-center w-full'>
            <button
              className='bg-Background/Bottom border-2 h-40 mx-6 border-Primary/Dark px-6 py-4 w-full max-w-4xl flex items-center justify-between rounded-3xl shadow-md lg:max-2xl:w-1/2 sm:max-lg:rounded-3xl lg:max-2xl:rounded-b-3xl sm:max-lg:mx-10 lg:max-2xl:mt-0
        border-solid box-border border-2 mb-10 rounded-3xl lg:border-t-0 text-center mt-0 p-14 mt-28 lg:rounded-none
        sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12'
              onClick={handleCreate}
            >
              <div className='inline-block -ml-2 -mt-4  sm:max-lg:-mt-4 lg:max-2xl:-mt-2 sm:max-md:-ml-2 md:max-2xl:ml-4'>
                <img
                  src={avatarUrl || ''}
                  alt='Profile Icon'
                  className='w-16 h-16 rounded-full object-cover'
                />
              </div>

              {/* Share Text Section */}
              <div className='bg-Background/Middle inline-block -mt-2 py-4 pl-4 rounded-3xl h-14 w-4/5 marker:sm:max-lg:-mt-2 lg:max-2xl:mt-0'>
                <p className='text-left text-Primary/Light text-l'>Share your code...</p>
              </div>
            </button>

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
            <div className='mb-6'>
              <div className='flex justify-center w-full'>
                <div
                  className={`${type === 'stored' ? 'lg:max-2xl:mt-8' : 'lg:max-2xl:mt-16'} flex bg-Background/Bottom text-center mx-6 mt-20 p-14 w-full max-w-4xl h-40 border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-28
    sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 lg:max-2xl:w-1/2 sm:max-lg:mt-20 sm:max-lg:mx-10`}
                >
                  <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-5 xl:max-2xl:mt-4'>
                    <p className='text-left text-white text-l'>
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
              className={`items-center ${type === 'stored' ? 'mt-28 sm:max-lg:mt-28 lg:max-2xl:mt-0' : ''}`}
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
          state={type}
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
        isTagListVisible={true}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />
    </div>
  );
}

export default Feed;

