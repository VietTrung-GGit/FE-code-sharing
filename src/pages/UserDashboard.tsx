import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { CgPassword } from 'react-icons/cg';

import { useAuthUser } from '../context/AuthUserContext';

import { formatNumber, formatDateSimple } from '../utils/helpers';

import { Post, fetchUserPosts } from '../services/postService';
import {
  getUserPublicData,
  UserBriefData,
  UserPublicData,
  fetchUserFollowers,
  followUser,
  unfollowUser,
} from '../services/userService';
import { ProjectDataBrief, fetchUserProjects } from '../services/projectService';
import {
  GroupDataBrief,
  GroupData,
  getGroupFullData,
  joinGroup,
  leaveGroup,
  fetchUserGroups,
} from '../services/groupService';

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
import { usePinned } from '../context/PinnedContext';
import { TbPin } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';
import NothingPost from '../components/nothingPost';
import { FaFilter } from 'react-icons/fa';
import { MdOutlineSearch } from 'react-icons/md';

interface UserDashboardProps {
  active: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ active }) => {
  // const { user } = useUser();
  const { pin, isPinned } = usePinned();

  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [modeEditChange, setModeEditChange] = useState<'editprofile' | 'editpassword' | null>(null);

  const textEmailRef = useRef<HTMLDivElement>(null);
  const textUserDashboardRef = useRef<HTMLDivElement>(null);
  const textUserProfileRef = useRef<HTMLDivElement>(null);

  const { userId } = useParams<string>();
  const alreadyPinned = userId ? isPinned('user', userId) : false;
  {
    userId && (
      <div>
        {/* Use alreadyPinned here */}
        {alreadyPinned ? 'Pinned' : 'Not Pinned'}
      </div>
    );
  }
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
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [groups, setGroups] = useState<GroupDataBrief[]>([]);
  const [projects, setProjects] = useState<ProjectDataBrief[]>([]);
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
    if (active === 'Posts') setPosts([]);
    if (active === 'Users') setUsers([]);
    if (active === 'Groups') setGroups([]);
    if (active === 'Projects') setProjects([]);

    // Fetch data based on active filter
    if (active === 'Posts') fetchAndUpdatePosts();
    if (active === 'Users') fetchAndUpdateUsers();
    if (active === 'Groups') fetchAndUpdateGroups();
    if (active === 'Projects') fetchAndUpdateProjects();
  }, [active, debouncedSearchTerm, searchParams]);

  useEffect(() => {
    if (active) {
      navigate(`/user/${userId}/${active.replace(/\s+/g, '')?.toLowerCase()}`);
    }
  }, [active, navigate]);

  useEffect(() => {
    if (hasMore && !firstLoad) {
      if (active === 'Posts') fetchAndUpdatePosts();
      if (active === 'Users') fetchAndUpdateUsers();
      if (active === 'Groups') fetchAndUpdateGroups();
      if (active === 'Projects') fetchAndUpdateProjects();
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
        setIsFollowing(data.followed);
        setHost(data.user);
        setLoading(false);
        console.log(data); // Log the fetched data directly
      } catch (error) {
        toast.error('Failed to load post');
      }
    };

    fetchData();
  }, [userId]);

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

  useEffect(() => {
    setFollowersCount(host?.totalFollowers || 0);
  }, [host]);

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
  // Handle option selection
  const handleOptionSelect = () => {
    setIsDropdownConfigOpen(false); // Close after selection
  };
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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };
  useEffect(() => {
    {
      own && setHost(user);
    }
  }, [user]);

  const handleFollow = async () => {
    if (host && userId) {
      try {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        await followUser(userId);
        toast.success(`Followed ${host.displayname}`);
      } catch (error) {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        toast.error('Failed to follow user');
      }
    }
  };

  const handleUnfollow = async () => {
    if (host && userId) {
      try {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        await unfollowUser(userId);
        toast.info(`Unfollowed ${host.displayname}`);
      } catch (error) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.error('Failed to unfollow user');
      }
    }
  };
  const [numDashboardCount, setNumDashboardCount] = useState<
    'Posts' | 'Users' | 'Groups' | 'Projects'
  >('Posts');
  const [isEmailOverflowing, setIsEmailOverflowing] = useState(false);
  const [isUsernameOverflowing, setIsUsernameOverflowing] = useState(false);
  const [isUsernameProfOverflowing, setIsUsernameProfOverflowing] = useState(false);
  const checkOverflow = () => {
    if (textEmailRef.current) {
      setIsEmailOverflowing(textEmailRef.current.scrollWidth > textEmailRef.current.clientWidth);
    }
    if (textUserDashboardRef.current) {
      setIsUsernameOverflowing(
        textUserDashboardRef.current.scrollWidth > textUserDashboardRef.current.clientWidth,
      );
    }
    if (textUserProfileRef.current) {
      setIsUsernameProfOverflowing(
        textUserProfileRef.current.scrollWidth > textUserProfileRef.current.clientWidth,
      );
    }
  };
  useEffect(() => {
    checkOverflow();
  }, [host?.email]);

  useEffect(() => {
    checkOverflow();
  }, [host?.username]);

  const shortenEmail = (email: string | undefined) => {
    const [name, domain] = email.split('@');
    return `${name.slice(0, 5)}...@${domain}`;
  };
  const { theme } = useTheme();
  return (
    <div className='bg-[var(--background)] text-[var(--text)]  relative min-h-screen flex flex-col w-full'>
      <>
        <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
          <div
            className={`${
              theme === 'original'
                ? 'bg-Background/Bottom text-white border-2'
                : 'bg-[var(--surface)] text-[var(--text)]'
            }  justify-center w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[720px] xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] border-Primary/Dark rounded-3xl lg:p-5 relative flex items-center`}
          >
            <div className='absolute right-3 top-2' ref={dropdownConfigRef}>
              <button
                onClick={() => setIsDropdownConfigOpen(!isDropdownConfigOpen)}
                className='hover:text-gray-300  text-3xl'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div className='absolute -right-10 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 bg-Background/Bottom border rounded-xl border-2 border-Primary/Dark shadow-lg z-10'>
                  <ul className=' py-2 text-sm'>
                    <li>
                      {userId && !own && (
                        <button
                          className={`block px-4 py-2 w-full text-left flex items-center gap-4 rounded  hover:bg-Background/Middle transition ${
                            alreadyPinned ? 'text-gray-500 cursor-not-allowed' : ''
                          }`}
                          onClick={() => !alreadyPinned && pin('user', userId)}
                          disabled={alreadyPinned}
                        >
                          <TbPin className='text-lg lg:text-xl' />
                          Pin
                        </button>
                      )}
                    </li>
                    {own && (
                      <>
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                            onClick={() => {
                              setShowProfileEditModal((prev) => !prev),
                                setModeEditChange('editprofile'),
                                handleOptionSelect();
                            }}
                          >
                            <BiSolidEdit className='text-lg lg:text-xl' />
                            Edit my profile
                          </button>
                        </li>
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                            onClick={() => {
                              setShowProfileEditModal((prev) => !prev),
                                setModeEditChange('editpassword');
                              handleOptionSelect();
                            }}
                          >
                            <CgPassword className='text-lg lg:text-xl' />
                            Change password
                          </button>
                        </li>
                        {/* <li>
                          <button className='text-sm block px-4 py-2 text-red-500 hover:bg-Background/Middle w-full text-left flex flex-row gap-4'>
                            <AiOutlineUserDelete className='text-lg lg:text-xl' />
                            Delete account
                          </button>
                        </li> */}
                      </>
                    )}
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
                  src={host?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                  alt='Profile Icon'
                  className='w-16 h-16 xxsm:w-28 xxsm:h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-full object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
                />
                {!own && (
                  <div className='flex hidden sm:block lg:hidden'>
                    <button
                      className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-28 lg:w-28 h-8 lg:h-8 px-[2px] rounded-xl text-xs sm:text-lg lg:text-base text-Accent/Target mb-4 
        ${isFollowing ? 'bg-Accent/Target  hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:'}`}
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {isFollowing ? (isHovered ? 'Unfollow' : 'Followed') : 'Follow'}
                    </button>
                  </div>
                )}
                <div
                  className={` flex items-center lg:mt-12 xl:mt-4 ${!own ? '' : 'mt-[50px]'} space-x-2 hidden sm:block `}
                >
                  <IoIosMail className='text-[var(--text-title)] text-3xl -mt-2 sm:inline-block' />

                  <div className='flex flex-row w-40 sm:inline-block   ' ref={textEmailRef}>
                    <a
                      href={host?.email ? `mailto:${host.email}` : '#'}
                      className=' whitespace-nowrap block '
                      data-tooltip-id='email'
                      data-tooltip-content={host?.email ? host.email : 'null'}
                      data-tooltip-place='bottom'
                    >
                      {isEmailOverflowing
                        ? shortenEmail(host?.email) || 'Email'
                        : host?.email || 'Email'}
                    </a>
                    <Tooltip id='email' classNameArrow='noArrow' />
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col space-y-4 mb-6 sm:mb-6 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0 ${!own ? 'xsm:mt-4' : 'xsm:mt-8 mt-4'}  sm:mt-0`}
              >
                <div className='flex flex-row sm:-mt-4 lg:mt-0'>
                  <div className='flex flex-col '>
                    <div className=''>
                      <p className=' font-semibold mt-6 text-2xl  sm:text-3xl  break-words'>
                        {host && host.displayname.length > 12
                          ? `${host?.displayname.slice(0, 9)}...` || 'Display name'
                          : host?.displayname || 'Display name'}
                        <Tooltip id='displayname' classNameArrow='noArrow' />
                      </p>
                    </div>
                    <div className='-mt-8 xsm:-mt-8 lg:-mt-8 xl:-mt-6 '>
                      <p className='text-[var(--text-title)] mt-8 text-md sm:text-lg lg:text-xl '>
                        @
                        {host && host.username.length > 20
                          ? ` ${host?.username.slice(0, 17)}...` || 'Username'
                          : host?.username || 'Username'}
                        <Tooltip id='usernameprof' classNameArrow='noArrow' />
                      </p>
                    </div>
                    <div className=' flex items-center mt-1 xsm:mt-1 sm:space-x-2 block sm:hidden text-xs sm:text-lg lg:text-xl '>
                      <IoIosMail className='text-[var(--text-title)] text-xl' />

                      <div className='flex w-32 flex-row overflow-x-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
                        <a
                          href={host?.email ? `mailto:${host.email}` : '#'}
                          className=' text-sm whitespace-nowrap block'
                        >
                          {host?.email || 'Email'}
                        </a>
                      </div>
                    </div>
                    {!own && (
                      <div className='flex sm:hidden xsm:mt-4 mt-3'>
                        <button
                          className={`transition-colors font-semibold duration-300 ease-in-out w-24 md:w-20 lg:w-28 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target mt-2 xsm:mt-4 
        ${isFollowing ? 'bg-Accent/Target  hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:'}`}
                          onClick={isFollowing ? handleUnfollow : handleFollow}
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          {isFollowing ? (isHovered ? 'Unfollow' : 'Followed') : 'Follow'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className='bg-[var(--input)] sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] xsm:h-1/2 sm:h-full rounded-xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static '>
                  <p className=' p-4'>{host?.story || "I'm here to share my code!"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
          <div
            className={` bg-center bg-cover bg-[var(--background-side)]  border-2 border-[var(--border)] h-36   px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-5`}
          >
            {host && (
              <div className='flex flex-col items-center'>
                <div className='flex items-center mx-2 mb-4'>
                  <div className='flex flex-col'>
                    <p className='text-[var(--text-title)] xsm:text-xl text-lg font-semibold text-center break-words'>
                      @{host?.username || 'Username'}&nbsp;
                    </p>

                    <p className='text-gray-500 xsm:text-md text-sm font-semibold break-words'>
                      joined in {formatDateSimple(host.createdAt)}
                    </p>
                  </div>
                </div>
                <div className='flex flex-row gap-6 xsm:gap-8 sm:gap-20 '>
                  <div className='flex flex-col'>
                    <p className=' xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalPosts) || 0}
                    </p>

                    <p className='text-[var(--text-title)] text-md flex justify-center'>Posts</p>
                  </div>

                  <div className='flex flex-col'>
                    <p className=' xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalLikes) || 0}
                    </p>
                    <p className='text-[var(--text-title)] text-md flex justify-center'>Likes</p>
                  </div>

                  <div className='flex flex-col'>
                    <p className=' xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(followersCount) || 0}
                    </p>
                    <p className='text-[var(--text-title)] text-md flex justify-center'>
                      Followers
                    </p>
                  </div>
                  <div className='flex flex-col'>
                    <p className=' xsm:text-xl text-lg flex justify-center'>
                      {formatNumber(host?.totalFollowing) || 0}
                    </p>
                    <p className='text-[var(--text-title)] text-md flex justify-center'>
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
              className={`${active === 'Posts' ? '' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => navigate(`/user/${userId}/posts`)}
            >
              Posts
            </button>
            <button
              className={`${active === 'Users' ? '' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => navigate(`/user/${userId}/users`)}
            >
              Following
            </button>
            <button
              className={`${active === 'Groups' ? '' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => navigate(`/user/${userId}/groups`)}
            >
              Groups
            </button>
            <button
              className={`${active === 'Projects' ? '' : 'text-gray-500'} text-xl font-semibold`}
              onClick={() => navigate(`/user/${userId}/projects`)}
            >
              Projects
            </button>
          </div>
        </div>
        <div className='flex lg:justify-center mt-2 xsm:mt-2 sm:max-lg:mt-4 lg:mt-6 mx-6 sm:max-lg:mx-20 lg:mx-20'>
          <div className='flex flex-start w-1/2 xl:min-w-[650px] mb-10 lg:mb-0 ml-8 sm:ml-0'>
            <p className='text-2xl font-semibold '>{active === 'Users' ? 'Following' : active}</p>
          </div>
        </div>
      </>

      <div className='flex justify-center -mt-8 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-3'>
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
                  ? 'bg-Background/Middle text-[var(--text-title)] '
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
              <div
                className={`fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
              >
                <div ref={tagListRef}>
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

      {active === 'Posts' && (
        <div className='mb-5'>
          <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
            {own && (
              <div
                className={`${
                  theme === 'original'
                    ? 'bg-Background/Bottom border-2 border-Primary/Dark'
                    : 'bg-[var(--surface)] text-[var(--text)]'
                } w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] mb-5 mt-5 border-Primary/Dark rounded-3xl p-5 md:p-7 lg:p-8`}
              >
                <div className='flex flex-row w-full items-center space-x-4'>
                  <div className='inline-block flex-shrink-0'>
                    <img
                      src={user?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                      alt='Profile Icon'
                    />
                  </div>

                  {/* Share Text Section */}
                  <button
                    className={`bg-[var(--input)] text-gray-400'
                } inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap`}
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
        </div>
      )}

      {/* Show LoadingSpinner during the first load */}
      {firstLoad ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Show NothingPost only after the first load, no posts, and not loading */}
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
          {active == 'Groups' && groups.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {groups.map((group) => (
                <div key={group._id}>
                  <GroupBrief groupData={group} />
                </div>
              ))}
            </div>
          )}
          {/* Display projects if available */}
          {active == 'Projects' && projects.length > 0 && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {projects.map((project) => (
                <div key={project._id}>
                  <ProjectBrief projectData={project} detail={false} />
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

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        {host && (
          <div className=' bg-cover rounded-3xl bg-[var(--background-side)]  border-2 border-[var(--border)] lg:w-[22vw] xl:w-[19vw] h-[400px] mt-4 ml-[3rem] '>
            <div className='flex flex-col'>
              <div className='flex justify-center mx-2' ref={textUserDashboardRef}>
                <p
                  className='text-[var(--text-title)] text-2xl font-semibold mt-16 text-center break-words'
                  data-tooltip-id='username'
                  data-tooltip-content={host?.username ? host.username : 'null'}
                  data-tooltip-place='top-end'
                >
                  @
                  {isUsernameOverflowing
                    ? `${host?.username.slice(0, 12)}...` || 'Username'
                    : host?.username || 'Username'}
                  <Tooltip id='username' classNameArrow='noArrow' />
                </p>
              </div>
              <p className='text-gray-500 xsm:text-md text-sm font-semibold text-center break-words'>
                Joined in {formatDateSimple(host.createdAt)}
              </p>
              <br />
              <div className='grid grid-cols-2 gap-10 mb-5'>
                <div className='flex flex-col items-start '>
                  <div className='ml-auto w-16'>
                    {' '}
                    <p className=' text-xl'>{formatNumber(host?.totalPosts) || 0}</p>
                    <p className='text-[var(--text-title)] text-md'>Posts</p>{' '}
                  </div>
                </div>

                <div className='flex flex-col items-start'>
                  <p className=' text-xl'>{formatNumber(host?.totalLikes) || 0}</p>
                  <p className='text-[var(--text-title)] text-md'>Likes</p>
                </div>

                <div className='flex flex-col items-start'>
                  <div className='ml-auto w-16'>
                    <p className=' text-xl'>{formatNumber(followersCount) || 0}</p>
                    <p className='text-[var(--text-title)] text-md'>Followers</p>
                  </div>
                </div>

                <div className='flex flex-col items-start'>
                  <p className=' text-xl'>{formatNumber(host?.totalFollowing) || 0}</p>
                  <p className='text-[var(--text-title)] text-md'>Following</p>
                </div>
              </div>
            </div>
            {!own && (
              <div className='flex justify-center lg:-mt-4 xl:ml-0'>
                <button
                  className={`transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20 lg:w-28 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target m-4 
       ${isFollowing ? 'bg-Accent/Target  hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:'}`}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {isFollowing ? (isHovered ? 'Unfollow' : 'Followed') : 'Follow'}
                </button>
              </div>
            )}
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

      <div className='flex lg:invisible' ref={quickNavRef}>
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

export default UserDashboard;

