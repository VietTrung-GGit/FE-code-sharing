import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { CgPassword } from 'react-icons/cg';

import { useAuthUser } from '../context/AuthUserContext';

import { formatNumber, formatDateSimple } from '../utils/helpers';

import { Post, fetchUserPosts } from '../services/postService';
import {
  getUserPublicData,
  UserPublicData,
  followUser,
  unfollowUser,
} from '../services/userService';

import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';

import Sidebar from '../components/sidebar';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import UserBrief from '../components/userBrief';
import ProfileEdit from '../components/profileEdit';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import GroupBrief from '../components/groupBrief';
import ProjectBrief from '../components/projectBrief';
import PostCreate from '../components/postCreate';
import LoadingSpinner from '../components/loadingAnimate';

import { Link } from 'react-router-dom';

function UserDashboard() {
  // const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [modeEditChange, setModeEditChange] = useState<'editprofile' | 'editpassword' | null>(null);
  const [activeDashboard, setActiveDashboard] = useState<'Posts' | 'Users' | 'Groups' | 'Projects'>(
    'Posts',
  );
  const { userId } = useParams<string>();
  const { user } = useAuthUser();
  const [host, setHost] = useState<UserPublicData | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [own, setOwn] = useState(false);
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
    if (userId) {
      setLoading(true);
      try {
        console.log('Debounced search term call:', debouncedSearchTerm);
        const postsResponse = await fetchUserPosts(
          userId,
          page,
          6, // Limit: 6 posts per page
          (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
          (searchParams.get('criteria') as string) || 'date',
          debouncedSearchTerm,
          searchParams.get('tags')?.split(',') || [],
        );

        setHasMore(postsResponse.hasMore);
        setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
        setLoading(false);
        setFirstLoad(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  };

  const fetchAndUpdateUsers = async () => {
    if (userId) {
      setLoading(true);
      try {
        const usersResponse = await fetchUserFollowers(
          userId,
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
    }
  };

  const fetchAndUpdateGroups = async () => {
    if (userId) {
      setLoading(true);
      try {
        const groupsResponse = await fetchUserGroups(
          userId,
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
    }
  };

  const fetchAndUpdateProjects = async () => {
    if (userId) {
      if (host) {
        setLoading(true);
        try {
          const projectsResponse = await fetchUserProjects(
            userId,
            page,
            6,
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
      }
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

  useEffect(() => {
    if (hasMore && !firstLoad) {
      console.log('2');

      fetchAndUpdatePosts();
    }
  }, []);

  useEffect(() => {
    if (userId === user?._id) {
      setOwn(true);
      setHost(user);
      return;
    }

    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await getUserPublicData(userId);
        setHost(data.user);
        setLoading(false);
        console.log(data); // Log the fetched data directly
      } catch (error) {
        toast.error('Failed to load post');
      }
    };

    fetchData();
  }, [userId]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/community/posts?${querySortParam}`);
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
  const handleCloseTagModal = () => {
    setShowTaglistModal(false);
  };
  const [showPostCreate, setShowPostCreate] = useState<boolean>(false);

  const handleCloseEditModal = () => {
    setShowProfileEditModal(false);
  };

  const handleCreate = () => {
    setShowPostCreate(true);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };
  useEffect(() => {
    {
      own && setHost(user);
    }
  }, [user]);
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col w-full'>
      <>
        <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
          <div className='bg-Background/Bottom text-white justify-center w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[620px] xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] border-Primary/Dark border-2 rounded-3xl lg:p-5 relative flex items-center'>
            <div className='absolute right-3 top-2' ref={dropdownConfigRef}>
              <button
                onClick={() => setIsDropdownConfigOpen(!isDropdownConfigOpen)}
                className='hover:text-gray-300 text-white text-3xl'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div className='absolute sm:-right-[50px] lg:-right-40 w-40 md:w-52 bg-Background/Bottom border rounded-xl border-2 border-Primary/Dark shadow-lg z-10'>
                  <ul className=' py-2 text-sm'>
                    <li>
                      <button
                        className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                        onClick={() => {
                          setShowProfileEditModal((prev) => !prev),
                            setModeEditChange('editprofile');
                        }}
                      >
                        <BiSolidEdit className='text-lg lg:text-xl' />
                        Edit my profile
                      </button>
                    </li>
                    <li>
                      <button
                        className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                        onClick={() => {
                          setShowProfileEditModal((prev) => !prev),
                            setModeEditChange('editpassword');
                        }}
                      >
                        <CgPassword className='text-lg lg:text-xl' />
                        Change password
                      </button>
                    </li>
                    <li>
                      <button className='text-sm block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                        <AiOutlineUserDelete className='text-lg lg:text-xl' />
                        Delete account
                      </button>
                    </li>
                  </ul>
                </div>
              )}
              {showProfileEditModal && (
                <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
                  <ProfileEdit modeChange={modeEditChange} closeModal={handleCloseEditModal} />
                </div>
              )}
            </div>

            <div className='flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-4 xl:space-x-2 mt-10 xsm:mt-8 sm:-mt-2 lg:-mt-1 mb-44 xsm:mb-48 sm:mb-0 lg:-ml-2 xl:-ml-4'>
              <div className=' sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
                <img
                  src={
                    host?.avatar ||
                    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                  }
                  alt='Profile Icon'
                  className='w-28 h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-full object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
                />
                <div className='flex hidden sm:block lg:hidden'>
                  <button className='transition-colors duration-300 ease-in-out w-36 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Target'>
                    Follow
                  </button>
                </div>
                <div className=' flex items-center lg:mt-10 xl:mt-4 space-x-2 hidden sm:block'>
                  <IoIosMail className='text-Primary/Light text-3xl sm:inline-block' />

                  <div className='flex flex-row sm:inline-block'>
                    <a href={host?.email ? `mailto:${host.email}` : '#'} className='text-white'>
                      {host?.email || 'Email'}
                    </a>
                  </div>
                </div>
              </div>

              <div className='flex flex-col space-y-4 mb-6 sm:mb-6 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0 xsm:mt-4 sm:mt-0'>
                <div className='flex flex-row sm:-mt-4 lg:mt-0'>
                  <div className='flex flex-col'>
                    <div className=''>
                      <p className='text-white font-semibold mt-6 text-2xl  sm:text-3xl  break-words'>
                        {host?.displayname || 'Display name'}
                      </p>
                    </div>
                    <div className='-mt-8 xsm:-mt-8 lg:-mt-8 xl:-mt-6'>
                      <p className='text-Primary/Light mt-8 text-md sm:text-lg lg:text-xl break-words'>
                        @{host?.username || 'Username'}
                      </p>
                    </div>
                    <div className=' flex items-center mt-1 xsm:mt-1 sm:space-x-2 block sm:hidden text-xs sm:text-lg lg:text-xl '>
                      <IoIosMail className='text-Primary/Light text-xl' />

                      <div className='flex flex-row'>
                        <a
                          href={host?.email ? `mailto:${host.email}` : '#'}
                          className='text-white text-sm'
                        >
                          {host?.email || 'Email'}
                        </a>
                      </div>
                    </div>
                    <div className='flex sm:hidden xsm:mt-4 mt-3'>
                      <button className='w-28 transition-colors duration-300 ease-in-out py-0 px-4 rounded-xl bg-Accent/Target text-lg sm:text-lg text-white mb-4 hover:bg-white hover:text-Accent/Target'>
                        Follow
                      </button>
                    </div>
                  </div>
                </div>

                <div className='bg-Background/Middle sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] xsm:h-1/2 sm:h-full rounded-xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static '>
                  <p className='text-white p-4'>{host?.story || "I'm here to share my codes!"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
          <div
            className={`bg-Background/Bottom bg-center bg-cover border-2 h-36  border-Primary/Dark px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-8 sm:max-lg:mt-16 `}
          >
            {host && (
              <div className='flex flex-col items-center'>
                <div className='flex mx-2 mb-4'>
                  <p className='text-white xsm:text-2xl text-xl font-semibold text-center break-words'>
                    {host?.username || 'Username'}'s Dashboard
                  </p>

                  <p className='text-white xsm:text-2xl text-xl font-semibold text-center break-words'>
                    Joined in {formatDateSimple(host.createdAt)}
                  </p>
                </div>
                <div className='flex flex-row gap-4 xsm:gap-8 sm:gap-20 '>
                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalPosts) || 0}
                    </p>

                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Posts
                    </p>
                  </div>

                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalLikes) || 0}
                    </p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Likes
                    </p>
                  </div>

                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalFollowers) || 0}
                    </p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Followers
                    </p>
                  </div>
                  <div className='flex flex-col'>
                    <p className='text-white xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalFollowing) || 0}
                    </p>
                    <p className='text-Primary/Light xsm:text-xl text-lg flex justify-center'>
                      Following
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-center mt-8 sm:max-lg:mt-10 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
          <div className='flex flex-row justify-center gap-8 xsm:gap-14 sm:gap-24 lg:gap-16 xl:gap-28 2xl:gap-36 w-1/2'>
            <button
              className={`${activeDashboard === 'Posts' ? 'text-white' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => setActiveDashboard('Posts')}
            >
              Posts
            </button>
            <button
              className={`${activeDashboard === 'Users' ? 'text-white' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => setActiveDashboard('Users')}
            >
              Following
            </button>
            <button
              className={`${activeDashboard === 'Groups' ? 'text-white' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => setActiveDashboard('Groups')}
            >
              Groups
            </button>
            <button
              className={`${activeDashboard === 'Projects' ? 'text-white' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => setActiveDashboard('Projects')}
            >
              Projects
            </button>
          </div>
        </div>
        <div className='flex lg:justify-center mt-2 xsm:mt-2 sm:max-lg:mt-4 lg:mt-6 mx-6 sm:max-lg:mx-20 lg:mx-20'>
          <div className='flex w-1/2 mb-10 lg:mb-0 ml-8 sm:ml-0'>
            <p className='text-2xl font-semibold text-white'>
              {activeDashboard === 'Users' ? 'Following' : activeDashboard} (0)
            </p>
          </div>
        </div>
      </>

      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
        <div
          className={`bg-Background/Bottom border-2 h-18  border-Primary/Dark px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 flex items-center justify-between rounded-3xl
          border-solid box-border mb-5 text-center mt-2  `}
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
                      activeFilter={activeDashboard} //change according to the button option, posts as default
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
              <div className='bg-Background/Bottom text-white w-[88vw] sm:w-[94vw] lg:w-1/2 mb-5 mt-5 border-Primary/Dark border-2 rounded-3xl p-5 md:p-7 lg:p-8'>
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
                <div id='posts-container' className='mx-6 sm:max-lg:mx-14 lg:mx-8'>
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
      {activeDashboard === 'Users' && (
        <div className='mb-5'>
          <UserBrief />
        </div>
      )}
      {activeDashboard === 'Groups' && (
        <div className='mb-5'>
          <GroupBrief />
        </div>
      )}
      {activeDashboard === 'Projects' && (
        <div className='mb-5'>
          <ProjectBrief />
        </div>
      )}
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        {host && (
          <div className='bg-Background/Bottom bg-cover rounded-3xl border-2 border-Primary/Dark lg:w-[22vw] xl:w-[19vw] h-[400px] mt-4 ml-[3rem] '>
            <div className='flex flex-col'>
              <div className='flex justify-center mx-2'>
                <p className='text-Primary/Light text-2xl font-semibold mt-16 text-center break-words'>
                  @{host?.username || 'Username'}
                </p>
              </div>
              <p className='text-gray-500 xsm:text-md text-sm font-semibold text-center break-words'>
                Joined in {formatDateSimple(host.createdAt)}
              </p>
              <br />
              <div className='flex flex-row justify-center gap-10 mb-5'>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-end'>
                    {formatNumber(host?.totalPosts) || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Posts</p>
                </div>

                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-start'>
                    {formatNumber(host?.totalLikes) || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Likes</p>
                </div>
              </div>
              <div className='flex flex-row justify-center gap-10 mb-5'>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-end'>
                    {formatNumber(host?.totalFollowers) || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Followers</p>
                </div>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-start'>
                    {formatNumber(host?.totalFollowing) || 0}
                  </p>
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
        )}
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={own ? 'home' : 'community'}
          onClose={() => setActiveComponent(null)}
        />
      </div>

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

export default UserDashboard;

