import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useParams, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProjectCreate from '../components/projectCreate';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import { MdOutlinePublicOff, MdOutlinePublic, MdGroupRemove } from 'react-icons/md';
import { TbFlag, TbFlagOff } from 'react-icons/tb';
import { usePinned } from '../context/PinnedContext';

import { useAuthUser } from '../context/AuthUserContext';

import { ProjectDataBrief, fetchGroupProjects } from '../services/projectService';
import {
  Post,
  fetchGroupPosts,
  fetchGroupMyPosts,
  fetchGroupPendingPosts,
} from '../services/postService';
import {
  GroupDataBrief,
  GroupData,
  getGroupFullData,
  joinGroup,
  leaveGroup,
} from '../services/groupService';
import { UserBriefData, fetchGroupMembers } from '../services/userService';

import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import { TbPin } from 'react-icons/tb';
import Sidebar from '../components/sidebar';
import AddMember from '../components/addMember';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import UserBrief from '../components/userBrief';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import ProjectBrief from '../components/projectBrief';
import PostCreate from '../components/postCreate';
import LoadingSpinner from '../components/loadingAnimate';
import { AiFillPlusCircle } from 'react-icons/ai';
import GroupCreate from '../components/groupCreate';

type PostType = 'stored' | 'me' | undefined;

interface Params extends Record<string, string | undefined> {
  type: PostType;
}

interface GroupDashboardProps {
  active: string;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ active }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const { pin, isPinned } = usePinned();
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const mapValue = (value: string): 'Posts' | 'Users' | 'Projects' => {
    if (['Posts', 'My posts', 'Pending posts'].includes(value)) return 'Posts';
    if (value === 'Members') return 'Users';
    return 'Projects';
  };
  const alreadyPinned = groupId ? isPinned('group', groupId) : false;
  {
    groupId && (
      <div>
        {/* Use alreadyPinned here */}
        {alreadyPinned ? 'Pinned' : 'Not Pinned'}
      </div>
    );
  }
  const dashboardMap: Record<
    string,
    'Posts' | 'Members' | 'My posts' | 'Projects' | 'Pending posts'
  > = {
    posts: 'Posts',
    myposts: 'My posts',
    projects: 'Projects',
    members: 'Members',
    pendingposts: 'Pending posts',
  };

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [projects, setProjects] = useState<ProjectDataBrief[]>([]);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [moderation, setModeration] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showGroupEdit, setShowGroupEdit] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const [showProjectCreate, setShowProjectCreate] = useState<boolean>(false); // New state for modal visibility
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 600);
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
  const fetchAndUpdatePosts = async () => {
    if (groupId) {
      setLoading(true);
      try {
        console.log('Debounced search term call:', debouncedSearchTerm);
        const postsResponse = await fetchGroupPosts(
          groupId,
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
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  };

  const fetchAndUpdateMyPosts = async () => {
    if (groupId) {
      setLoading(true);
      try {
        console.log('Debounced search term call:', debouncedSearchTerm);
        const postsResponse = await fetchGroupMyPosts(
          groupId,
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
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  };

  const fetchAndUpdatePendingPosts = async () => {
    if (groupId) {
      setLoading(true);
      try {
        console.log('Debounced search term call:', debouncedSearchTerm);
        const postsResponse = await fetchGroupPendingPosts(
          groupId,
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
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  };

  const fetchAndUpdateUsers = async () => {
    if (groupId) {
      setLoading(true);
      try {
        const usersResponse = await fetchGroupMembers(
          groupId,
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
    }
  };

  const fetchAndUpdateProjects = async () => {
    if (groupId) {
      setLoading(true);
      try {
        const projectsResponse = await fetchGroupProjects(
          groupId,
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
      }
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);

    // Reset the corresponding data array
    if (active === 'Posts' || active === 'My posts' || active === 'Pending posts') setPosts([]);
    if (active === 'Members') setUsers([]);
    if (active === 'Projects') setProjects([]);

    // Fetch data based on active filter
    if (active === 'Posts') fetchAndUpdatePosts();
    if (active === 'My posts') fetchAndUpdateMyPosts();
    if (active === 'Pending posts') fetchAndUpdatePendingPosts();
    if (active === 'Members') fetchAndUpdateUsers();
    if (active === 'Projects') fetchAndUpdateProjects();
  }, [active, debouncedSearchTerm, searchParams]);

  useEffect(() => {
    if (hasMore) {
      if (active === 'Posts') fetchAndUpdatePosts();
      if (active === 'My posts') fetchAndUpdateMyPosts();
      if (active === 'Pending posts') fetchAndUpdatePendingPosts();
      if (active === 'Members') fetchAndUpdateUsers();
      if (active === 'Projects') fetchAndUpdateProjects();
    }
  }, [page]);

  useEffect(() => {
    if (active) {
      navigate(`/group/${groupId}/${active.replace(/\s+/g, '')?.toLowerCase()}`);
    }
  }, [active, navigate]);

  useEffect(() => {
    console.log(users);
    console.log(active == 'Members');
  }, [users]);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const data = await getGroupFullData(groupId);
        setGroup(data);
        setPrivacy(!data.canJoin);
        setHasJoined(data.joined);
        setModeration(data.moderation);

        // Handle avatar file if needed
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const handleJoin = async () => {
    if (group && group.canJoin && groupId) {
      try {
        setHasJoined(true);
        await joinGroup(groupId);
        toast.success(`Joined group: ${group.name}`);
      } catch (error) {
        setHasJoined(false);
        toast.error('Failed to join group');
      }
    }
  };

  const handleCloseTagModal = () => {
    setShowTaglistModal(false);
  };

  const handleLeave = async () => {
    if (group && groupId) {
      try {
        setHasJoined(false);
        await leaveGroup(groupId);
        toast.info(`Left group: ${group.name}`);
      } catch (error) {
        setHasJoined(true);
        toast.error('Failed to leave group');
      }
    }
  };

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/group/${groupId}/${active.replace(/\s+/g, '')?.toLowerCase()}?${querySortParam}`);
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
    setPage(1);
    setPosts([]);
    setHasMore(true);
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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col w-full'>
      <>
        <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
          <div className='bg-Background/Bottom text-white justify-center w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px]  xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] border-Primary/Dark border-2 rounded-3xl lg:p-5 relative flex items-center'>
            {group && (group.role == 'creator' || group.role == 'admin') && (
              <div className=' absolute right-3 top-2' ref={dropdownConfigRef}>
                <button
                  onClick={toggleDropdownConfig}
                  className='hover:text-gray-300 text-white text-3xl mx-[calc(10vw-2.2rem)] xsm:mx-[calc(10vw-2.6rem)] sm:mx-[calc(10vw-3.4rem)] lg:mx-[calc(10vw-5.2rem)] xl:mx-[calc(10vw-6.8rem)]'
                >
                  <IoIosMore />
                </button>
                {isDropdownConfigOpen && (
                  <div className='absolute -right-10 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 bg-Background/Bottom border rounded-xl border-2 border-Primary/Dark shadow-lg z-10'>
                    <ul className=' py-2 text-sm'>
                      <li>
                        {groupId && (
                          <button
                            className={`block px-4 py-2 w-full text-left flex items-center gap-4 rounded  hover:bg-Background/Middle transition ${
                              alreadyPinned ? 'text-gray-500 cursor-not-allowed' : ''
                            }`}
                            onClick={() => !alreadyPinned && pin('group', groupId)}
                            disabled={alreadyPinned}
                          >
                            <TbPin className='text-lg lg:text-xl' />
                            Pin
                          </button>
                        )}
                      </li>
                      {groupId && (group.role == 'admin' || group.role == 'creator') && (
                        <>
                          {' '}
                          <li>
                            <button
                              className='block px-4 py-2 text-white hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                              onClick={() => {
                                setShowGroupEdit((prev) => !prev);
                              }}
                            >
                              <BiSolidEdit className='text-lg lg:text-xl' />
                              Edit group profile
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
                {showGroupEdit && (
                  <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
                    <GroupCreate
                      groupId={groupId}
                      groupData={group}
                      // setGroup={setGroup}
                      closeModal={() => {
                        setShowGroupEdit(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className='flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-4 xl:space-x-2 mt-10 xsm:mt-8 sm:-mt-2 lg:-mt-1 mb-44 xsm:mb-48 sm:mb-0 lg:-ml-2 xl:-ml-4'>
              <div className='sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
                <img
                  src={
                    group?.avatar ||
                    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                  }
                  alt='Profile Icon'
                  className='w-28 h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-3xl object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
                />
                <div className='flex hidden sm:block lg:hidden -mt-2'>
                  <button
                    className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-32 lg:w-28 h-7 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target sm:my-2 
        ${hasJoined ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
                    onClick={hasJoined ? handleLeave : handleJoin}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                  </button>

                  {hasJoined && (
                    <div className='relative'>
                      <button
                        className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-32 lg:w-28 h-7 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target sm:my-2
    ${showInvite ? 'bg-Accent/Target text-white' : 'bg-white text-Accent/Target'}`}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && groupId && (
                        <div className='absolute top-12 right-20'>
                          {' '}
                          <AddMember
                            type='group'
                            desId={groupId}
                            isOpen={showInvite}
                            closeModal={() => setShowInvite(false)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className='flex items-center lg:mt-10 xl:mt-4 space-x-2 hidden lg:block'>
                  <div className='flex flex-row '>
                    {/* Avatar Members */}

                    {group && group?.members?.length > 0 && (
                      <div className='flex space-x-1'>
                        {group.members.map(({ avatar, user }, index) => (
                          <img
                            key={user || index} // Prefer `user` as a unique key if available
                            src={
                              avatar ||
                              'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                            }
                            alt={`Member: ${user || `Unknown ${index + 1}`}`}
                            className='w-8 h-8 rounded-full object-cover'
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex flex-col space-y-4 mb-6 sm:mb-6 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0'>
                <div className='flex flex-row sm:-mt-4 lg:mt-0 relative'>
                  <div className='flex flex-col'>
                    <div className='flex flex-col'>
                      <p className='text-white font-semibold mt-6 text-2xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                        {group?.name || 'Group Name'}
                      </p>
                      <div className='flex flex-row block xsm:mt-2 lg:hidden lg:static'>
                        {group && group?.members?.length > 0 && (
                          <div className='flex space-x-1'>
                            {group.members.map(({ avatar, user }, index) => (
                              <img
                                key={user || index} // Prefer `user` as a unique key if available
                                src={
                                  avatar ||
                                  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                                }
                                alt={`Member: ${user || `Unknown ${index + 1}`}`}
                                className='w-8 h-8 rounded-full object-cover'
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`transition-colors font-semibold sm:hidden duration-300 ease-in-out w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target my-1 xsm:my-2 mt-2 xsm:mt-4
        ${hasJoined ? 'bg-gray-500 text-white hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:text-white'}`}
                      onClick={hasJoined ? handleLeave : handleJoin}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                    </button>

                    {hasJoined && (
                      <div className='relative sm:hidden'>
                        <button
                          className={`transition-colors font-semibold duration-300 ease-in-out w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target my-1 xsm:my-2
                          ${showInvite ? 'bg-Accent/Target text-white' : 'bg-white text-Accent/Target'}`}
                          onClick={() => setShowInvite((prev) => !prev)}
                        >
                          Invite
                        </button>
                        {showInvite && groupId && (
                          <div className='absolute top-12 right-[300px]'>
                            {' '}
                            <AddMember
                              type='group'
                              desId={groupId}
                              isOpen={showInvite}
                              closeModal={() => setShowInvite(false)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='bg-Background/Middle sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] xsm:h-1/2 sm:h-full rounded-3xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static'>
                  <p className='text-Primary/Light p-4'>{group?.bio || 'Group Description'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
          <div
            className={`bg-Background/Bottom bg-center bg-cover border-2 h-56  border-Primary/Dark px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-6 `}
          >
            <div className='flex flex-col items-center '>
              <div className='flex flex-row gap-4 xsm:gap-8 sm:gap-20 '>
                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>
                    {group?.numberOfPostsApproved || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Posts</p>
                </div>

                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>
                    {group?.numberOfProjects || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Projects</p>
                </div>

                <div className='flex flex-col'>
                  <p className='text-white text-xl flex justify-center'>
                    {group?.numberOfMembers || 0}
                  </p>
                  <p className='text-Primary/Light text-xl flex justify-center'>Members</p>
                </div>
              </div>
              <div className='flex flex-row mt-4 gap-2'>
                <div className='flex justify-center items-center flex-row mx-4 sm:mx-4 lg:mx-6 gap-3'>
                  {privacy ? (
                    <MdOutlinePublicOff className='text-3xl text-white flex-shrink-0' />
                  ) : (
                    <MdOutlinePublic className='text-3xl text-white flex-shrink-0' />
                  )}
                  <p className='text-sm sm:text-md text-white text-left'>
                    {privacy
                      ? 'Content only visible to members.'
                      : 'This group is visible to everyone.'}
                  </p>
                </div>

                <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                  {moderation ? (
                    <TbFlag className='text-4xl text-white flex-shrink-0' />
                  ) : (
                    <TbFlagOff className='text-4xl text-white flex-shrink-0' />
                  )}
                  <p className='text-sm sm:text-md text-white text-left'>
                    {moderation
                      ? 'Posts need approval from admins.'
                      : 'Posts need no approval before upload.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex justify-center mt-8 sm:max-lg:mt-10 lg:mt-6 mx-16 xsm:mx-16  sm:mx-36 lg:mx-24 xl:mx-8 mb-5'>
          <div className='flex flex-row xl:justify-center gap-20 xsm:gap-20 sm:gap-24 lg:gap-20 xl:gap-20 2xl:gap-24 xsm:w-full lg:w-1/2 justify-start max-xl:overflow-y-auto max-xl:scrollbar-thin max-xl:scrollbar-thumb-gray-500 max-xl:scrollbar-track-transparent'>
            <button
              className={`${active === 'Posts' ? 'text-white' : 'text-gray-500'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/group/${groupId}/posts`)}
            >
              Posts
            </button>
            <button
              className={`${active === 'Projects' ? 'text-white' : 'text-gray-500'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/group/${groupId}/projects`)}
            >
              Projects
            </button>
            <button
              className={`${active === 'Members' ? 'text-white' : 'text-gray-500'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/group/${groupId}/members`)}
            >
              Members
            </button>
            <button
              className={`${active === 'My posts' ? 'text-white' : 'text-gray-500'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/group/${groupId}/myposts`)}
            >
              My posts
            </button>
            <button
              className={`${active === 'Pending posts' ? 'text-white' : 'text-gray-500'} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/group/${groupId}/pendingposts`)}
            >
              Pending posts
            </button>
          </div>
        </div>
        <div className='flex lg:justify-center mt-2 xsm:mt-2 sm:max-lg:mt-4 lg:mt-6 mx-6 sm:max-lg:mx-20 lg:mx-20'>
          <div className=' flex w-1/2 mb-10 lg:mb-0 ml-8 sm:ml-0'>
            {active != 'Projects' && <p className='text-2xl font-semibold text-white'>{active}</p>}
          </div>
          {/* New Group Button (Only when filter is 'groups') */}
          {active === 'Projects' && group && group.role == 'admin' && (
            <button
              onClick={() => {
                setShowProjectCreate(true);
              }}
              className='mr-2 transition-colors duration-300 ease-in-out w-28 rounded-2xl bg-Accent/Target text-lg text-white hover:bg-white hover:text-Accent/Target  flex flex-row gap-2 px-6 py-[2px] items-center'
            >
              <p>New</p>
              <AiFillPlusCircle className=' text-3xl mt-1' />
            </button>
          )}
        </div>
      </>

      <div className='flex justify-center -mt-10 sm:max-lg:-mt-10 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
        <div
          className={`bg-Background/Bottom border-2 h-18  border-Primary/Dark px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl
          border-solid box-border text-center mt-2 `}
        >
          <div className='flex flex-row w-full items-center space-x-4 mx-4 mt-0'>
            <div className='inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
              <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
            </div>

            {/* Share Text Section */}
            <input
              className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-Primary/Light text-l'
              placeholder={`Search for ${active.toLowerCase()}...`}
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
                      activeFilter={mapValue(active)} //change according to the button option, posts as default
                      initialCriteria={searchParams.get('criteria') as string}
                      initialOrder={
                        (searchParams.get('order') as 'ascending' | 'descending') || 'descending'
                      }
                      initialTags={searchParams.get('tags')?.split(',') || []}
                      handleClose={() => {
                        setShowTaglistModal(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {['Posts', 'My posts'].includes(active) && (
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
            <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 z-50'>
              <PostCreate
                closeModal={handleCloseModal}
                onPostCreated={refetchPosts}
                mode={1}
                desId={groupId}
                role={group?.role} // Cleaner way to pass `role` if `group` exists
                postRefId={refId || undefined} // Ensures it's only passed when defined
              />
            </div>
          )}
        </div>
      )}

      {/* Show NothingPost only after the first load, no posts, and not loading */}
      {((active === 'Posts' && posts.length === 0) ||
        (active === 'Members' && users.length === 0) ||
        (active === 'My posts' && posts.length === 0) ||
        (active === 'Pending posts' && posts.length === 0) ||
        (active === 'Projects' && projects.length === 0)) &&
        !loading && (
          <div className='mb-5'>
            <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
              <div
                className={`bg-Background/Bottom border-2 h-32  border-Primary/Dark px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl
                border-solid box-border text-center mt-3`}
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
      {active == 'Members' && group && users && (
        <div id='users-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {users.map((u) => (
            <div key={u._id}>
              <UserBrief userData={u} group={groupId} role={u.role} />
            </div>
          ))}
        </div>
      )}

      {/* Display posts if available */}
      {(active?.includes('Posts') || active?.includes('posts')) && posts.length > 0 && group && (
        <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
          {posts.map((post) => (
            <div key={post._id} className='post'>
              <PostBrief postData={post} shareAction={handleShare} role={group.role} />
            </div>
          ))}
        </div>
      )}

      {/* Display projects if available */}
      {active == 'Projects' && projects && (
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

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        <div className='bg-Background/Bottom bg-cover rounded-3xl border-2 border-Primary/Dark lg:w-[22vw] xl:w-[19vw] h-[400px] mt-4 ml-[3rem] lg:py-8 xl:py-8 '>
          <div className='flex flex-col '>
            <div className='flex justify-center mx-2'>
              <p className='text-white text-xl font-semibold text-center break-words'>
                {group?.name || 'Group name'}
              </p>
            </div>
            <div className='flex justify-center gap-2'>
              <button
                className={`transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20  h-6 lg:h-8 px-[5px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target my-4
        ${hasJoined ? 'bg-gray-500 text-white hover:bg-red-400 lg:w-24' : 'bg-white hover:bg-Accent/Target hover:text-white lg:w-28'}`}
                onClick={hasJoined ? handleLeave : handleJoin}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
              </button>
              <div className=''>
                {' '}
                {hasJoined && (
                  <div className='relative'>
                    <button
                      className={`transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20 lg:w-24 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target my-4
      ${showInvite ? 'bg-Accent/Target text-white' : 'bg-white text-Accent/Target'}`}
                      onClick={() => setShowInvite((prev) => !prev)}
                    >
                      Invite
                    </button>
                    {showInvite && groupId && (
                      <div className='absolute top-10 right-[400px]'>
                        {' '}
                        <AddMember
                          type='group'
                          desId={groupId}
                          isOpen={showInvite}
                          closeModal={() => setShowInvite(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-row justify-center lg:gap-2 xl:gap-4 2xl:gap-8 mb-5'>
              <div className='flex flex-col'>
                <p className='text-white text-xl flex justify-center'>
                  {group?.numberOfPostsApproved || 0}
                </p>
                <p className='text-Primary/Light text-md flex justify-center'>Posts</p>
              </div>

              <div className='flex flex-col'>
                <p className='text-white text-xl flex justify-center'>
                  {group?.numberOfProjects || 0}
                </p>
                <p className='text-Primary/Light text-md flex justify-center'>Projects</p>
              </div>

              <div className='flex flex-col'>
                <p className='text-white text-xl flex justify-center'>
                  {group?.numberOfMembers || 0}
                </p>
                <p className='text-Primary/Light text-md flex justify-center'>Members</p>
              </div>
            </div>
            <div className='flex gap-4 flex-col mx-4'>
              <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                {privacy ? (
                  <MdOutlinePublicOff className='text-3xl text-white flex-shrink-0' />
                ) : (
                  <MdOutlinePublic className='text-3xl text-white flex-shrink-0' />
                )}
                <p className='text-sm xl:text-md text-white text-left'>
                  {privacy
                    ? 'Content only visible to members.'
                    : 'This group is visible to everyone.'}
                </p>
              </div>
              <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                {moderation ? (
                  <TbFlag className='text-4xl text-white flex-shrink-0' />
                ) : (
                  <TbFlagOff className='text-3xl text-white flex-shrink-0' />
                )}
                <p className='text-sm xl:text-md text-white text-left'>
                  {moderation
                    ? 'Posts need approval from admins.'
                    : 'Posts need no approval before upload.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={'community'}
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
      {showProjectCreate && groupId && (
        <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
          <ProjectCreate
            groupId={groupId}
            closeModal={() => {
              setShowProjectCreate(false); // Close the modal when the close button is clicked
            }}
          />
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

export default GroupDashboard;

