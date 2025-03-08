import { useState, useEffect, useRef } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { useDebounce } from '@uidotdev/usehooks';
import { AiFillPlusCircle } from 'react-icons/ai';
import GroupCreate from '../components/groupCreate';
import GroupBrief from '../components/groupBrief';
import UserBrief from '../components/userBrief';
import ProjectBrief from '../components/projectBrief';
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
import { useTheme } from '../context/ThemeContext';
import { MdOutlineSearch } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa';
import NothingPost from '../components/nothingPost';

interface CommunityProps {
  active: string;
}

const Community: React.FC<CommunityProps> = ({ active }) => {
  // const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [showGroupCreate, setShowGroupCreate] = useState<boolean>(false); // New state for modal visibility
  const { theme } = useTheme();
  const location = useLocation();
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownConfigOpen, setIsDropdownConfigOpen] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);

  const dropdownFilterRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 600);

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
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoading(true);

    setPosts([]);
    setUsers([]);
    setGroups([]);
    setProjects([]);
  }, [active, debouncedSearchTerm, searchParams]);

  useEffect(() => {
    if (hasMore && loading) {
      switch (active) {
        case 'Posts':
          if (posts.length === 0) fetchAndUpdatePosts();
          break;
        case 'Users':
          if (users.length === 0) fetchAndUpdateUsers();
          break;
        case 'Groups':
          if (groups.length === 0) fetchAndUpdateGroups();
          break;
        case 'Projects':
          if (projects.length === 0) fetchAndUpdateProjects();
          break;
      }
    }
  }, [posts, users, groups, projects]);

  useEffect(() => {
    if (hasMore) {
      if (active === 'Posts') fetchAndUpdatePosts();
      if (active === 'Users') fetchAndUpdateUsers();
      if (active === 'Groups') fetchAndUpdateGroups();
      if (active === 'Projects') fetchAndUpdateProjects();
    }
  }, [page]);

  const handleCloseGroupModal = () => {
    setShowGroupCreate(false); // Close the modal when the close button is clicked
  };

  useEffect(() => {
    console.log(posts);
  }, [posts]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/community/${active.toLowerCase()}?${querySortParam}`);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore) return;
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
  }, [hasMore, loading]);

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleQuickNav = () => {
    setActiveComponent((prev) => (prev === 'quicknav' ? null : 'quicknav'));
  };
  const refetchPosts = () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    // Reset the corresponding data array
    if (active === 'Posts') setPosts([]);
    if (active === 'Groups') setGroups([]);
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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };

  const handleCloseTagModal = () => {
    setShowTaglistModal(false);
  };

  return (
    <div
      className={`bg-[var(--background)] text-[var(--text)]  relative min-h-screen flex flex-col w-full`}
    >
      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-0 mx-6 sm:max-lg:mx-14 lg:mx-8'>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom border-2  border-Primary/Dark'
              : 'bg-[var(--surface)]'
          } h-18  px-6 py-4 w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl  sm:max-lg:rounded-3xl lg:mt-0 lg:border-t-0 lg:rounded-none lg:rounded-b-3xl
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
              placeholder={`Search for ${active.toLowerCase()}...`}
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
              <div>
                <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
                  <div ref={modalRef}>
                    <TagList
                      onFilterChange={handleFilterChange}
                      feedShowTaglistModal={showTaglistModal}
                      activeFilter={active} //change according to the button option, posts as default
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
          <div className='flex justify-center mt-3 xxsm:mt-8 sm:max-lg:mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-2'>
            <div className='overflow-x-auto scrollbar text-base xxsm:text-lg xsm:text-xl flex flex-row justify-center gap-8 xsm:gap-14 sm:gap-24 lg:gap-16 xl:gap-28 2xl:gap-36w-[94vw] lg:w-1/2 xl:min-w-[650px]'>
              <button
                className={`${active === 'Posts' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} `}
                onClick={() => navigate(`/community/posts`)}
              >
                Posts
              </button>
              <button
                className={`${active === 'Users' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} `}
                onClick={() => navigate(`/community/users`)}
              >
                Users
              </button>
              <button
                className={`${active === 'Groups' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'}  `}
                onClick={() => navigate(`/community/groups`)}
              >
                Groups
              </button>
              <button
                className={`${active === 'Projects' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} `}
                onClick={() => navigate(`/community/projects`)}
              >
                Projects
              </button>
            </div>
          </div>
          <div className='flex lg:justify-center mt-2 xsm:mt-2 sm:max-lg:mt-4 lg:mt-6 mx-6 sm:max-lg:mx-20 lg:mx-20'>
            <div
              className={`flex ${active === 'Groups' ? ' w-full xsm:w-full sm:w-full lg:w-2/5 xl:min-w-[550px]' : 'w-1/2 xl:min-w-[650px]'}  flex-start  ml-8 sm:ml-0`}
            >
              <p className='text-2xl font-semibold'>{active}</p>
            </div>
            <div
              className='flex flex-row justify-end items-center mr-6 sm:mr-0'
              ref={dropdownFilterRef}
            >
              {/* New Group Button (Only when filter is 'groups') */}
              {active === 'Groups' && (
                <button
                  onClick={() => {
                    setShowGroupCreate(true);
                  }}
                  className={`${
                    theme === 'original'
                      ? 'bg-Accent/Target  hover:text-Accent/Target hover:bg-white'
                      : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border border-[var(--border)] text-Accent/Target'
                  } transition-colors duration-300 ease-in-out w-28 rounded-2xl text-lg flex flex-row gap-2 px-6 py-[2px] items-center`}
                >
                  <p>New</p>
                  <AiFillPlusCircle className=' text-3xl' />
                </button>
              )}
            </div>
          </div>

          {/*}  <div className='flex justify-center items-center relative mx-6 sm:max-lg:mx-14 lg:mx-10'>
            <div
              className='flex flex-row justify-end items-center w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] '
              ref={dropdownFilterRef}
            >
              
              {active === 'Groups' && (
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
            </div>*/}
        </>
      </>
      {active == 'Posts' && (
        <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
          <div
            className={`${
              theme === 'original'
                ? 'bg-Background/Bottom border-2 border-Primary/Dark'
                : 'bg-[var(--surface)] text-[var(--text)]'
            } w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-3 rounded-3xl p-5 md:p-7 lg:p-8`}
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
                className={`bg-[var(--input)] text-gray-400 inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap`}
                onClick={handleCreate}
              >
                <p className='text-left text-sm overflow-hidden'>Share your code...</p>
              </button>
            </div>
          </div>

          {showPostCreate && (
            <div className='flex h-screen w-screen items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
              <PostCreate
                closeModal={handleCloseModal}
                onPostCreated={refetchPosts}
                {...(refId ? { postRefId: refId } : {})}
              />
            </div>
          )}
        </div>
      )}
      {((active === 'Posts' && posts.length === 0) ||
        (active === 'Users' && users.length === 0) ||
        (active === 'Groups' && groups.length === 0) ||
        (active === 'Projects' && projects.length === 0)) &&
        !loading && <NothingPost />}

      {/* Display posts if available */}
      {active == 'Posts' && posts.length > 0 && (
        <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {posts.map((post) => (
            <div key={post._id} className='post'>
              <PostBrief postData={post} shareAction={handleShare} />
            </div>
          ))}
        </div>
      )}
      {/* Display posts if available */}
      {active == 'Users' && users.length > 0 && (
        <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {users.map((user) => (
            <div key={user._id}>
              <UserBrief userData={user} />
            </div>
          ))}
        </div>
      )}
      {/* Display groups if available */}
      {active == 'Groups' && groups.length > 0 && user && (
        <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {groups.map((group) => (
            <div key={group._id}>
              <GroupBrief userId={user._id} groupData={group} />
            </div>
          ))}
        </div>
      )}
      {/* Display projects if available */}
      {active == 'Projects' && projects.length > 0 && user && (
        <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {projects.map((project) => (
            <div key={project._id}>
              <ProjectBrief userId={user._id} projectData={project} detail={true} />
            </div>
          ))}
        </div>
      )}
      {/* Show LoadingSpinner during additional data fetching */}
      {loading && <LoadingSpinner />}

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

      <div ref={quickNavRef}>
        <QuickNav
          isOpen={activeComponent === 'quicknav'}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      {showGroupCreate && (
        <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <GroupCreate closeModal={handleCloseGroupModal} onGroupCreated={refetchPosts} />
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
};

export default Community;

