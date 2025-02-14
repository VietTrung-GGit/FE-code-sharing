import { useState, useEffect, useRef } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { useDebounce } from '@uidotdev/usehooks';
import { AiFillPlusCircle } from 'react-icons/ai';
import GroupCreate from '../components/groupCreate';
import GroupBrief from '../components/groupBrief';
import UserBrief from '../components/userBrief';
import ProjectBrief from '../components/projectBrief';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Post, fetchPosts } from '../services/postService';
import { fetchUsers, UserBriefData } from '../services/userService';
import { fetchGroups, GroupDataBrief } from '../services/groupService';
import { fetchProjects, ProjectDataBrief } from '../services/projectService';
import LoadingSpinner from '../components/loadingAnimate';
import PostCreate from '../components/postCreate';
import { Link } from 'react-router-dom';

function Community() {
  // const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [showGroupCreate, setShowGroupCreate] = useState<boolean>(false); // New state for modal visibility

  const location = useLocation();

  const getActiveFilter = (): 'Posts' | 'Users' | 'Groups' | 'Projects' => {
    const path = location.pathname.split('?')[0]; // Remove query parameters

    switch (path) {
      case '/community/posts':
        return 'Posts';
      case '/community/users':
        return 'Users';
      case '/community/groups':
        return 'Groups';
      case '/community/projects':
        return 'Projects';
      default:
        return 'Posts'; // Default state
    }
  };

  useEffect(() => {
    setActiveButtonFilter(getActiveFilter());
  }, [location.pathname]);
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

  // States

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

  const [activeButtonFilter, setActiveButtonFilter] = useState<
    'Posts' | 'Users' | 'Groups' | 'Projects'
  >(getActiveFilter());

  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [groups, setGroups] = useState<GroupDataBrief[]>([]);
  const [projects, setProjects] = useState<ProjectDataBrief[]>([]);
  const fetchAndUpdatePosts = async () => {
    setLoading(true);
    try {
      console.log('Debounced search term call:', debouncedSearchTerm);
      const postsResponse = await fetchPosts(
        page,
        6, // Limit: 6 posts per page
        (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
        (searchParams.get('criteria') as string) || 'date',
        debouncedSearchTerm,
        searchParams.get('tags')?.split(',') || [],
        undefined,
      );

      setHasMore(postsResponse.hasMore);
      setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
      setLoading(false);
      setFirstLoad(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  const fetchAndUpdateUsers = async () => {
    setLoading(true);
    try {
      const usersResponse = await fetchUsers(
        page,
        6,
        (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
        (searchParams.get('criteria') as 'dateJoined' | 'followers' | 'likes') || 'dateJoined',
        debouncedSearchTerm,
      );
      setHasMore(usersResponse.hasMore);
      setUsers((prevUsers) => [...prevUsers, ...usersResponse.users]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  };

  const fetchAndUpdateGroups = async () => {
    setLoading(true);
    try {
      const groupsResponse = await fetchGroups(
        page,
        6, // Limit: 6 posts per page
        (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
        (searchParams.get('criteria') as 'dateCreated' | 'members' | 'posts') || 'members',
        debouncedSearchTerm,
      );
      setHasMore(groupsResponse.hasMore);
      setGroups((prevGroups) => [...prevGroups, ...groupsResponse.groups]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  };

  const fetchAndUpdateProjects = async () => {
    setLoading(true);
    try {
      const projectsResponse = await fetchProjects(
        page,
        6, // Limit: 6 posts per page
        (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
        (searchParams.get('criteria') as 'dateCreated' | 'members' | 'posts') || 'members',
        debouncedSearchTerm,
      );
      setHasMore(projectsResponse.hasMore);
      setProjects((prevProjects) => [...prevProjects, ...projectsResponse.projects]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);

    // Reset the corresponding data array
    if (activeButtonFilter === 'Posts') setPosts([]);
    if (activeButtonFilter === 'Users') setUsers([]);
    if (activeButtonFilter === 'Groups') setGroups([]);
    if (activeButtonFilter === 'Projects') setProjects([]);

    // Fetch data based on active filter
    if (activeButtonFilter === 'Posts') fetchAndUpdatePosts();
    if (activeButtonFilter === 'Users') fetchAndUpdateUsers();
    if (activeButtonFilter === 'Groups') fetchAndUpdateGroups();
    if (activeButtonFilter === 'Projects') fetchAndUpdateProjects();
  }, [activeButtonFilter, debouncedSearchTerm, searchParams]);

  useEffect(() => {
    if (hasMore && !firstLoad) {
      if (activeButtonFilter === 'Posts') fetchAndUpdatePosts();
      if (activeButtonFilter === 'Users') fetchAndUpdateUsers();
      if (activeButtonFilter === 'Groups') fetchAndUpdateGroups();
      if (activeButtonFilter === 'Projects') fetchAndUpdateProjects();
    }
  }, [page]);

  const handleCloseGroupModal = () => {
    setShowGroupCreate(false); // Close the modal when the close button is clicked
  };

  useEffect(() => {
    if (activeButtonFilter) {
      navigate(`/community/${activeButtonFilter.toLowerCase()}`);
    }
  }, [activeButtonFilter, navigate]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/community/${activeButtonFilter.toLowerCase()}?${querySortParam}`);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
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
  const [refId, setRefId] = useState<string>('');
  const { user } = useAuthUser();

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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };

  const handleCloseTagModal = () => {
    setShowTaglistModal(false);
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col w-full'>
      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-0 mx-6 sm:max-lg:mx-14 lg:mx-8'>
        <div
          className={`bg-Background/Bottom border-2 h-18  border-Primary/Dark px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl  sm:max-lg:rounded-3xl lg:mt-0 lg:border-t-0 lg:rounded-none lg:rounded-b-3xl
        border-solid box-border mb-3 text-center mt-28 `}
        >
          <div className='flex flex-row w-full items-center space-x-4 mx-4 mt-0'>
            <div className='inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
              <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
            </div>

            {/* Share Text Section */}
            <input
              className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-Primary/Light text-l'
              placeholder={`Search for ${activeButtonFilter.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            ></input>

            <button
              className='hover:bg-Background/Middle rounded-lg hover:bg-gray-300 hover:bg-opacity-20 block '
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
                      activeFilter={activeButtonFilter} //change according to the button option, posts as default
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
        <>
          <div className='flex justify-center items-center relative my-3 mx-6 sm:max-lg:mx-14 lg:mx-10'>
            <div
              className='flex flex-row justify-between items-center w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] '
              ref={dropdownFilterRef}
            >
              {/* Filter Button */}
              <div className='relative'>
                <button
                  className='ml-2 text-lg bg-Primary/Light text-Primary/Dark rounded-2xl font-semibold px-4 py-1 w-36 flex flex-row justify-center items-center'
                  onClick={toggleDropdownFilter}
                >
                  {activeButtonFilter}
                  <div className='ml-2'>
                    <IoMdArrowDropdown className='text-3xl' />
                  </div>
                </button>
                {isDropdownFilterOpen && (
                  <div className='ml-2 absolute left-0 top-full mt-2 w-36 bg-white border rounded-2xl shadow-lg z-10'>
                    <ul className='py-2 my-1 flex flex-col items-center'>
                      {(['Posts', 'Users', 'Groups', 'Projects'] as const).map((item) => (
                        <li key={item} className='w-full'>
                          <button
                            className={`block px-8 py-1 text-left text-lg text-Primary/Dark font-semibold w-full flex justify-start items-center transition-colors ${
                              activeButtonFilter === item
                                ? 'bg-Primary/Light'
                                : 'hover:bg-gray-300 bg-white'
                            }`}
                            onClick={() => {
                              setActiveButtonFilter(item);
                              toggleDropdownFilter();
                            }}
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* New Group Button (Only when filter is 'groups') */}
              {activeButtonFilter === 'Groups' && (
                <button
                  onClick={() => {
                    setShowGroupCreate(true);
                  }}
                  className='mr-2 transition-colors duration-300 ease-in-out w-28 rounded-2xl bg-Accent/Target text-lg text-white hover:bg-white hover:text-Accent/Target  flex flex-row gap-2 px-6 py-[2px] items-center'
                >
                  <p>New</p>
                  <AiFillPlusCircle className=' text-3xl mt-1' />
                </button>
              )}
            </div>
          </div>
        </>
      </>

      {/* Show LoadingSpinner during the first load */}
      {firstLoad ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Show NothingPost only after the first load, no posts, and not loading */}
          {!loading &&
            ((activeButtonFilter === 'Posts' && posts.length === 0) ||
              (activeButtonFilter === 'Users' && users.length === 0) ||
              (activeButtonFilter === 'Groups' && groups.length === 0) ||
              (activeButtonFilter === 'Projects' && projects.length === 0)) && (
              <div className='mb-5'>
                <div className='flex justify-center mx-0 lg:mx-6'>
                  <div
                    className={`lg:mt-4 mx-6 sm:max-lg:mx-14 lg:mx-8 flex bg-Background/Bottom text-center p-12 w-full h-40 border-Primary/Dark border-solid box-border border-2 rounded-3xl
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-1/2 mt-4`}
                  >
                    <div className='h-auto'>
                      <p className='text-left text-white text-l -mt-2 xsmnopost:mt-2 sm:mt-2 xl:mt-4'>
                        Nothing here... Go explore{' '}
                        <Link
                          to='/community/posts'
                          className='text-Accent/Target cursor-pointer inline'
                        >
                          Codemunity&nbsp;
                        </Link>
                        for more interesting content!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          {activeButtonFilter == 'Posts' && (
            <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
              <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-3 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
                <div className='flex flex-row w-full items-center space-x-4'>
                  <div className='inline-block flex-shrink-0'>
                    <img
                      src={
                        user?.avatar ||
                        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                      }
                      alt='Profile Icon'
                      className='w-[52px] h-[52px] rounded-full object-cover'
                    />
                  </div>

                  {/* Share Text Section */}
                  <button
                    className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap'
                    onClick={handleCreate}
                  >
                    <p className='text-left text-Primary/Light text-sm overflow-hidden'>
                      Share your code...
                    </p>
                  </button>
                </div>
              </div>

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
          )}

          {/* Display posts if available */}
          {activeButtonFilter == 'Posts' && posts.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {posts.map((post) => (
                <div key={post._id} className='post'>
                  <PostBrief postData={post} shareAction={handleShare} />
                </div>
              ))}
            </div>
          )}

          {/* Display posts if available */}
          {activeButtonFilter == 'Users' && users.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {users.map((user) => (
                <div key={user._id}>
                  <UserBrief userData={user} />
                </div>
              ))}
            </div>
          )}

          {/* Display groups if available */}
          {activeButtonFilter == 'Groups' && groups.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {groups.map((group) => (
                <div key={group._id}>
                  <GroupBrief groupData={group} />
                </div>
              ))}
            </div>
          )}
          {/* Display projects if available */}
          {activeButtonFilter == 'Projects' && projects.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {projects.map((project) => (
                <div key={project._id}>
                  <ProjectBrief projectData={project} />
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
          state={'community'}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      <div>
        <QuickNav
          isOpen={activeComponent === 'quicknav'}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {showGroupCreate && (
        <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <GroupCreate closeModal={handleCloseGroupModal} />
        </div>
      )}

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

export default Community;

