import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useParams, useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import ProjectCreate from '../components/projectCreate';
import { IoIosMore, IoIosMail, IoMdArrowDropdown, IoIosCloseCircleOutline } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import {
  MdOutlinePublicOff,
  MdOutlinePublic,
  MdGroupRemove,
  MdOutlineSearch,
} from 'react-icons/md';
import { TbFlag, TbFlagOff, TbPinnedOff } from 'react-icons/tb';
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
  GroupData,
  getGroupFullData,
  joinGroup,
  leaveGroup,
  deleteGroup,
  GroupDataCreate,
} from '../services/groupService';
import { UserBriefData, fetchGroupMembers } from '../services/userService';
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
import { AiFillPlusCircle, AiOutlineUsergroupDelete } from 'react-icons/ai';
import GroupCreate from '../components/groupCreate';
import NothingPost from '../components/nothingPost';
import { FaFilter } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { formatNumber } from '../utils/helpers';

type PostType = 'stored' | 'me' | undefined;

interface Params extends Record<string, string | undefined> {
  type: PostType;
}

interface GroupDashboardProps {
  active: string;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ active }) => {
  const { groupId } = useParams<{ groupId: string }>();
  const { pin, isPinned, unPin } = usePinned();
  const [searchParams] = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'quicknav' | null>(null);
  const [postCount, setPostCount] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);
  const [showTaglistModal, setShowTaglistModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const quickNavRef = useRef<HTMLDivElement>(null); // Ref for the modal content
  const quickNavButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const alreadyPinned = groupId ? isPinned('group', groupId) : false;
  const [pinned, setPinned] = useState(alreadyPinned);
  const handlePinToggle = () => {
    if (groupId) {
      if (pinned) {
        unPin(undefined, groupId);
      } else {
        pin('group', groupId);
      }
    }

    setPinned((prev) => !prev);
  };

  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [projects, setProjects] = useState<ProjectDataBrief[]>([]);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [moderation, setModeration] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showGroupEdit, setShowGroupEdit] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownConfigOpen, setIsDropdownConfigOpen] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);
  const dropdownFilterRef = useRef<HTMLDivElement>(null);
  const [showProjectCreate, setShowProjectCreate] = useState<boolean>(false);
  const { theme } = useTheme();
  const isAdmin = group && (group.role == 'admin' || group.role == 'creator');
  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const [refId, setRefId] = useState<string>('');
  const [waiting, setWaiting] = useState(false);
  const [showGroupConfigModal, setShowGroupConfigModal] = useState(false);
  const modalGroupConfigRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setShowGroupConfigModal(false); // Close the logout confirmation modal
  };

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
    if (hasJoined || !privacy) {
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
    }
  }, [active, debouncedSearchTerm, searchParams]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/group/${groupId}/posts?${querySortParam}`);
  };

  useEffect(() => {
    if (hasMore) {
      if (active === 'Posts') fetchAndUpdatePosts();
      if (active === 'My posts') fetchAndUpdateMyPosts();
      if (active === 'Pending posts') fetchAndUpdatePendingPosts();
      if (active === 'Members') fetchAndUpdateUsers();
      if (active === 'Projects') fetchAndUpdateProjects();
    }
  }, [page]);

  // useEffect(() => {
  //   if (active) {
  //     navigate(`/group/${groupId}/${active.replace(/\s+/g, '')?.toLowerCase()}`);
  //   }
  // }, [active]);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const data = await getGroupFullData(groupId);
        setGroup(data);
        setPostCount(data.numberOfPostsApproved);
        setPrivacy(!data.canJoin);
        setHasJoined(data.joined);
        setModeration(data.moderation);
        setLoading(false);
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
        setWaiting(true);
        await joinGroup(groupId);
        setWaiting(false);
        toast.success(`Joined group: ${group.name}`);
        setGroup((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            numberOfMembers: prev.numberOfMembers + 1,
          };
        });
      } catch (error) {
        setHasJoined(false);
        toast.error('Failed to join group');
      }
    }
  };

  const handleLeave = async () => {
    if (group && groupId) {
      try {
        setHasJoined(false);
        setWaiting(true);
        await leaveGroup(groupId);
        setWaiting(false);
        toast.info(`Left group: ${group.name}`);
      } catch (error) {
        setHasJoined(true);
        toast.error('Failed to leave group');
      }
    }
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

    if (active.toLowerCase().includes('posts')) {
      setPosts([]);
      fetchAndUpdatePosts();
    }
    if (active === 'Projects') {
      setProjects([]);
      fetchAndUpdateProjects();
    }
  };

  const refreshGroup = (progroup: GroupDataCreate) => {
    setGroup(
      (prevGroup) =>
        prevGroup
          ? {
              ...prevGroup, // Keep all existing properties
              ...progroup, // Override only the properties from progroup
              avatar: progroup.avatar ? URL.createObjectURL(progroup.avatar) : prevGroup.avatar, // Convert File to URL if present
              bio: progroup.description, // Keep unchanged since GroupDataCreate doesn’t have bio
              canJoin: !progroup.private, // Keep unchanged
              joined: prevGroup.joined, // Keep unchanged
              members: prevGroup.members, // Keep unchanged
              numberOfMembers: prevGroup.numberOfMembers, // Keep unchanged
              numberOfPostsApproved: prevGroup.numberOfPostsApproved, // Keep unchanged
              numberOfProjects: prevGroup.numberOfProjects, // Keep unchanged
              role: prevGroup.role, // Keep unchanged
            }
          : prevGroup, // If prevGroup is null, return it as is
    );
    setPrivacy(progroup.private);
    setModeration(progroup.moderation);
  };

  const handleDecreaseMember = () => {
    setGroup((prev) => {
      if (!prev) return prev;
      return {
        ...prev, // Spread all properties to maintain the full object
        numberOfMembers: prev.numberOfMembers - 1,
      };
    });
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

  const textGroupDashboardRef = useRef<HTMLDivElement>(null);
  const [isGroupnameOverflowing, setIsGroupnameOverflowing] = useState(false);
  const checkOverflow = () => {
    if (textGroupDashboardRef.current) {
      setIsGroupnameOverflowing(
        textGroupDashboardRef.current.scrollWidth > textGroupDashboardRef.current.clientWidth,
      );
    }
  };

  useEffect(() => {
    checkOverflow();
  }, [group?.name]);
  return (
    <div className='bg-[var(--background)] text-[var(--text)] relative min-h-screen flex flex-col w-full'>
      <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom text-white border-2'
              : 'bg-[var(--surface)] text-[var(--text)]'
          }  justify-center w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[720px] lg:h-[400px] sm:h-[420px] xxsm:h-[560px] h-[530px] border-Primary/Dark rounded-3xl lg:p-5 relative flex items-center`}
        >
          {group && (
            <div className='absolute right-3 top-2 h-4' ref={dropdownConfigRef}>
              <button
                onClick={toggleDropdownConfig}
                className='hover:text-[var(--text-hovered)] text-3xl'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div
                  className={`${
                    theme === 'original'
                      ? 'bg-Background/Bottom text-white'
                      : 'bg-[var(--surface)] text-[var(--text)]'
                  } border border-[var(--border)] absolute -right-10 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 rounded-xl shadow-lg z-10`}
                >
                  <ul className=' py-2 text-sm'>
                    <li>
                      {groupId && (
                        <button
                          className='block px-4 py-2 w-full text-left flex items-center gap-4 hover:bg-[var(--background-hovered)] transition'
                          onClick={handlePinToggle}
                        >
                          {pinned ? (
                            <TbPinnedOff className='text-lg lg:text-xl' />
                          ) : (
                            <TbPin className='text-lg lg:text-xl' />
                          )}

                          {pinned ? 'Unpin' : 'Pin'}
                        </button>
                      )}
                    </li>
                    {groupId && isAdmin && (
                      <>
                        {' '}
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                            onClick={() => {
                              setShowGroupEdit((prev) => !prev);
                            }}
                          >
                            <BiSolidEdit className='text-lg lg:text-xl' />
                            Edit group profile
                          </button>
                        </li>
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-[var(--background-hovered)] text-red-500  w-full text-left flex flex-row gap-4'
                            onClick={() => setShowGroupConfigModal(true)}
                          >
                            <AiOutlineUsergroupDelete className='text-lg lg:text-xl' />
                            Delete group
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
                    refresh={refreshGroup}
                    // setGroup={setGroup}
                    closeModal={() => {
                      setShowGroupEdit(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {groupId && isAdmin && showGroupConfigModal && (
            <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
              <div
                className={`
              ${
                theme === 'original'
                  ? 'bg-Background/Bottom text-white border-2'
                  : 'bg-[var(--surface)] text-[var(--text)]'
              } border-Primary/Dark p-8 rounded-3xl max-w-sm w-full justify-center flex-col items-center`}
                ref={modalGroupConfigRef}
              >
                <div className='flex justify-center items-center mb-4 -translate-x-2'>
                  <IoIosCloseCircleOutline className='text-6xl  text-red-300' />
                </div>
                <h3 className='text-xl mb-2 text-center font-semibold'>Delete?</h3>
                <h3 className='text-base mb-4 text-gray-400 text-center'>
                  Are you sure you want to delete this group?
                </h3>
                <div className='flex justify-between text-base'>
                  <button
                    className={`${
                      theme === 'original'
                        ? 'bg-white text-Primary/Dark'
                        : 'bg-[var(--button)] text-[var(--text)]  '
                    }  ml-7 border-[var(--border)] px-4 py-1 rounded-lg hover:bg-[var(--button-hovered)]`}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className='mr-7 bg-red-400 px-4 py-1 rounded-lg hover:bg-red-500'
                    onClick={async () => {
                      try {
                        await deleteGroup(groupId);
                        navigate('/community/posts');
                        toast.success('Group deleted successfully!');
                        // Optionally, you can navigate away or update state after deletion
                      } catch (error) {
                        toast.error('Failed to delete group!');
                        console.error(error);
                      }
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className='flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-4 xl:space-x-2 mt-10 xsm:mt-8 sm:mt-6 lg:-mt-1 mb-44 xsm:mb-48 sm:mb-0 lg:-ml-2 xl:-ml-4'>
            <div className='sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
              <img
                src={group?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                alt='Profile Icon'
                className='w-20 h-20 xxsm:w-28 xxsm:h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-3xl object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
              />
              <div className='hidden sm:flex flex-row gap-x-4 lg:hidden mt-2'>
                {(hasJoined || !privacy) && group && group.role != 'creator' && (
                  <div className='flex'>
                    <button
                      className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-24 lg:w-28 h-7 px-[2px] rounded-xl text-xs sm:text-base text-Accent/Target sm:my-2 
                    ${
                      theme === 'original'
                        ? hasJoined
                          ? 'bg-[var(--button-active)] hover:bg-red-400 text-white'
                          : 'bg-white hover:bg-Accent/Target hover:text-white text-Accent/Target'
                        : hasJoined
                          ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
                          : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
                    }`}
                      onClick={hasJoined ? handleLeave : handleJoin}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      disabled={loading || waiting}
                    >
                      {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                    </button>
                  </div>
                )}

                {hasJoined &&
                  (!privacy || (group && (group.role === 'admin' || group.role === 'creator'))) && (
                    <div className='relative flex'>
                      <button
                        className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-24 lg:w-28 h-7 px-[2px] rounded-xl text-xs sm:text-base lg:text-base sm:my-2 `}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && groupId && (
                        <div className='lg:absolute top-12 right-20'>
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
              <div className='flex items-center lg:mt-8 xl:mt-0 space-x-2 hidden lg:block'>
                <div className='flex flex-row '>
                  {/* Avatar Members */}

                  {group && group?.members?.length > 0 && (
                    <div className='flex space-x-1 -mt-4 xl:mt-0'>
                      {group.members.slice(0, 4).map(({ avatar, user }, index) => (
                        <img
                          key={user || index} // Prefer `user` as a unique key if available
                          src={avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                          alt={`Member: ${user || `Unknown ${index + 1}`}`}
                          className='w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover'
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='flex flex-col space-y-4 mb-6 sm:mb-6 lg:mb-10 ml-4 xsm:ml-20 sm:ml-0'>
              <div className='flex flex-row sm:-mt-4 lg:mt-0'>
                <div className='flex flex-col'>
                  <div
                    className={`flex flex-col ${group && group.role == 'creator' ? 'xxsm:mt-4 xsm:max-sm:mt-6' : ''}`}
                  >
                    <p className=' font-semibold mt-6 text-lg xsm:text-xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                      {group && group?.name.length > 12
                        ? `${group?.name.slice(0, 9)}...` || 'Group name'
                        : group?.name || 'Group name'}
                    </p>
                    <div className='flex flex-row block sm:mt-2 lg:hidden lg:static'>
                      {group && group?.members?.length > 0 && (
                        <div className='flex space-x-1'>
                          {group.members.slice(0, 4).map(({ avatar, user }, index) => (
                            <img
                              key={user || index} // Prefer `user` as a unique key if available
                              src={avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                              alt={`Member: ${user || `Unknown ${index + 1}`}`}
                              className='w-6 h-6 xxsm:w-8 xxsm:h-8 rounded-full object-cover'
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-row xxsm:flex-col xxsm:mt-0 mt-1 gap-x-2 xxsm:gap-x-0'>
                    {(hasJoined || !privacy) && group && group.role != 'creator' && (
                      <button
                        disabled={loading || waiting}
                        className={`transition-colors font-semibold sm:hidden duration-300 ease-in-out w-16 xxsm:w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-base lg:text-base text-Accent/Target my-1 xsm:my-2 mt-2 xsm:mt-4
                      ${
                        theme === 'original'
                          ? hasJoined
                            ? 'bg-[var(--button-active)] hover:bg-red-400 text-white'
                            : 'bg-white hover:bg-Accent/Target hover:text-white text-Accent/Target'
                          : hasJoined
                            ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
                            : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
                      }`}
                        onClick={hasJoined ? handleLeave : handleJoin}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                      >
                        {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                      </button>
                    )}

                    {hasJoined &&
                      (!privacy ||
                        (group && (group.role === 'admin' || group.role === 'creator'))) && (
                        <div className='relative sm:hidden'>
                          <button
                            disabled={loading || waiting}
                            className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target transition-colors font-semibold duration-300 ease-in-out w-16 xxsm:w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-base lg:text-base my-1 xsm:my-2 mt-2 xxsm:mt-0
                       `}
                            onClick={() => setShowInvite((prev) => !prev)}
                          >
                            Invite
                          </button>
                          {showInvite && groupId && (
                            <div className='lg:absolute top-12 right-[300px]'>
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
              </div>

              <div className='bg-[var(--input)] sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] lg:max-xl:max-h-[230px] xsm:h-1/2 sm:h-[170px] lg:h-full rounded-3xl absolute xsm:top-52 xsm:inset-x-8 xxsm:top-48 top-40 inset-x-4 sm:static break-words overflow-hidden overflow-y-auto   scrollbar '>
                <p className='p-4'>{group?.bio || 'Group Description'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-center mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
        <div
          className={` bg-center bg-cover h-56 bg-[var(--background-side)]  border-2 border-[var(--border)] px-2 xxsm:px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-6 `}
        >
          <div className='flex flex-col items-center gap-y-4 xxsm:gap-y-0'>
            <div className='flex flex-row gap-4 xsm:gap-8 sm:gap-20 '>
              <div className='flex flex-col'>
                <p className=' text-xl flex justify-center'>{formatNumber(postCount) || 0}</p>
                <p className='text-[var(--text-title)] text-lg xxsm:text-xl flex justify-center'>
                  Posts
                </p>
              </div>

              <div className='flex flex-col'>
                <p className=' text-xl flex justify-center'>
                  {formatNumber(group?.numberOfProjects) || 0}
                </p>
                <p className='text-[var(--text-title)] text-lg xxsm:text-xl flex justify-center'>
                  Projects
                </p>
              </div>

              <div className='flex flex-col'>
                <p className=' text-xl flex justify-center'>
                  {formatNumber(group?.numberOfMembers) || 1}
                </p>
                <p className='text-[var(--text-title)] text-lg xxsm:text-xl flex justify-center'>
                  Members
                </p>
              </div>
            </div>
            <div className='flex flex-row mt-4 gap-2'>
              <div className='flex justify-center items-center flex-row mx-4 sm:mx-4 lg:mx-6 gap-3'>
                {privacy ? (
                  <MdOutlinePublicOff className='text-2xl xsm:text-3xl  flex-shrink-0' />
                ) : (
                  <MdOutlinePublic className='text-2xl xsm:text-3xl  flex-shrink-0' />
                )}
                <p className='text-xs xxsm:text-sm sm:text-base  text-left'>
                  {privacy
                    ? 'Content only visible to members.'
                    : 'This group is visible to everyone.'}
                </p>
              </div>

              <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                {moderation ? (
                  <TbFlag className='text-3xl xsm:text-4xl  flex-shrink-0' />
                ) : (
                  <TbFlagOff className='text-3xl xsm:text-4xl  flex-shrink-0' />
                )}
                <p className='text-xs xxsm:text-sm sm:text-base  text-left'>
                  {moderation
                    ? 'Posts need approval from admins.'
                    : 'Posts need no approval before upload.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasJoined || !privacy ? (
        <>
          <div className='flex justify-center  mt-8 lg:mt-6 mx-16 xsm:mx-16 sm:mx-36 lg:mx-24 xl:mx-8'>
            <div className='overflow-x-auto scrollbar text-base xxsm:text-lg xsm:text-xl flex flex-row xl:justify-center gap-20 xsm:gap-20 sm:gap-24 lg:gap-20 xl:gap-20 2xl:gap-24 xsm:w-full lg:w-1/2 justify-start max-xl:overflow-y-auto'>
              <button
                className={`${active === 'Posts' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} whitespace-nowrap`}
                onClick={() => navigate(`/group/${groupId}/posts`)}
                disabled={loading}
              >
                Posts
              </button>
              <button
                className={`${active === 'Projects' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} whitespace-nowrap`}
                onClick={() => navigate(`/group/${groupId}/projects`)}
                disabled={loading}
              >
                Projects
              </button>
              <button
                className={`${active === 'Members' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} whitespace-nowrap`}
                onClick={() => navigate(`/group/${groupId}/members`)}
                disabled={loading}
              >
                Members
              </button>
              <button
                className={`${active === 'My posts' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} whitespace-nowrap`}
                onClick={() => navigate(`/group/${groupId}/myposts`)}
                disabled={loading}
              >
                My posts
              </button>
              {isAdmin && moderation && (
                <button
                  className={`${active === 'Pending posts' ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} whitespace-nowrap`}
                  onClick={() => navigate(`/group/${groupId}/pendingposts`)}
                  disabled={loading}
                >
                  Pending posts
                </button>
              )}
            </div>
          </div>
          <div className='flex lg:justify-center mt-4 xsm:mt-4 sm:max-lg:mt-4 lg:mt-6 mx-6 sm:max-lg:mx-20 lg:mx-20'>
            <div className='flex justify-between w-[94vw] lg:w-1/2 xl:min-w-[650px] xl:min-w-[650px] mb-0 ml-8 sm:ml-0'>
              <p className='text-2xl font-semibold '>{active}</p>

              {active === 'Projects' && isAdmin && (
                <button
                  onClick={() => {
                    setShowProjectCreate(true);
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

          {/* Search and Filter Section */}
          <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8 my-3'>
            <div
              className={`${
                theme === 'original'
                  ? 'bg-Background/Bottom border-2 border-Primary/Dark'
                  : 'bg-[var(--surface)]'
              } h-18 px-6 py-4 w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl border-solid box-border text-center`}
            >
              <div className='flex flex-row w-full items-center space-x-4 mx-4'>
                <div className='text-3xl inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
                  <MdOutlineSearch />
                </div>
                <input
                  className={`${
                    theme === 'original'
                      ? 'bg-Background/Middle text-[var(---text-title)]'
                      : 'bg-[var(--input)] text-[var(--text)]'
                  } inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-base`}
                  placeholder={`Search for ${active.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className='text-xl hover:bg-[var(--background-hovered)] rounded-lg hover:bg-gray-300 hover:bg-opacity-20 block'
                  onClick={() => setShowTaglistModal(!showTaglistModal)}
                >
                  <FaFilter />
                </button>

                {showTaglistModal && (
                  <div>
                    <div
                      className={`fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
                    >
                      <div ref={modalRef}>
                        <TagList
                          onFilterChange={handleFilterChange}
                          feedShowTaglistModal={showTaglistModal}
                          activeFilter={active} //change according to the button option, posts as default
                          initialCriteria={searchParams.get('criteria') as string}
                          initialOrder={
                            (searchParams.get('order') as 'ascending' | 'descending') ||
                            'descending'
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
            {showPostCreate && (
              <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
                <PostCreate
                  closeModal={handleCloseModal}
                  onPostCreated={() => {
                    refetchPosts();
                    if (!privacy || isAdmin) setPostCount((prev) => prev + 1);
                  }}
                  mode={1}
                  desId={groupId}
                  role={group?.role} // Cleaner way to pass `role` if `group` exists
                  postRefId={refId || undefined} // Ensures it's only passed when defined
                />
              </div>
            )}
          </div>

          {/* Content Sections */}
          {['Posts', 'My posts'].includes(active) && (
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
                  <button
                    className='bg-[var(--input)] text-gray-400 inline-block flex-grow py-4 px-4 rounded-3xl h-14 w-5/6 overflow-hidden whitespace-nowrap'
                    onClick={handleCreate}
                  >
                    <p className='text-left text-sm overflow-hidden'>Share your code...</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Rendering for Empty States */}
          {((active === 'Posts' && posts.length === 0) ||
            (active === 'Members' && users.length === 0) ||
            (active === 'My posts' && posts.length === 0) ||
            (active === 'Pending posts' && posts.length === 0) ||
            (active === 'Projects' && projects.length === 0)) &&
            !loading && <NothingPost />}

          {/* Content Lists */}
          {active === 'Members' && group && users && (
            <div id='users-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
              {users.map((u) => (
                <div key={u._id}>
                  <UserBrief
                    userData={u}
                    group={groupId}
                    role={group.role}
                    decreaseMember={handleDecreaseMember}
                  />
                </div>
              ))}
            </div>
          )}

          {(active?.includes('Posts') || active?.includes('posts')) &&
            posts.length > 0 &&
            group && (
              <div id='posts-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
                {posts.map((post) => (
                  <div key={post._id} className='post'>
                    <PostBrief
                      postData={post}
                      deletable={group.role == 'admin' || group.role == 'creator'}
                      onPostApproved={() => setPostCount((prev) => prev + 1)}
                      onPostDeleted={() => {
                        if (post.status === 'approved') {
                          setPostCount((prev) => prev - 1);
                        }
                      }}
                      shareAction={handleShare}
                      detail={false}
                      role={group.role}
                    />
                  </div>
                ))}
              </div>
            )}

          {active === 'Projects' && projects && user && (
            <div id='posts-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
              {projects.map((project) => (
                <div key={project._id}>
                  <ProjectBrief userId={user._id} projectData={project} detail={false} />
                </div>
              ))}
            </div>
          )}
          {loading && <LoadingSpinner />}
        </>
      ) : !loading ? (
        <div className='flex justify-center items-center h-[50vh]'>
          <p className='text-lg xxsm:text-xl text-gray-500 text-center'>
            You need to join this group to see its content.
          </p>
        </div>
      ) : null}

      {/* Show LoadingSpinner during additional data fetching */}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' fixed flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        <div className=' bg-cover rounded-3xl bg-[var(--background-side)]  border-2 border-[var(--border)] lg:w-[22vw] xl:w-[19vw] h-[400px] mt-4 ml-[3rem] lg:py-8 xl:py-8 '>
          <div className='flex flex-col lg:mt-6 xl:mt-4'>
            <div className='flex justify-center mx-2' ref={textGroupDashboardRef}>
              <p className=' text-xl font-semibold text-center break-words'>
                {isGroupnameOverflowing
                  ? `${group?.name.slice(0, 10)}...` || 'Group name'
                  : group?.name || 'Group name'}
              </p>
            </div>
            <div className='flex justify-center gap-2'>
              {(hasJoined || !privacy) && group && group.role != 'creator' && (
                <button
                  className={`transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20  h-6 lg:h-8 px-[5px] rounded-xl text-xs md:text-base lg:text-base text-Accent/Target my-4
                ${
                  theme === 'original'
                    ? hasJoined
                      ? 'bg-[var(--button-active)] hover:bg-red-400 text-white'
                      : 'bg-white hover:bg-Accent/Target hover:text-white text-Accent/Target'
                    : hasJoined
                      ? 'bg-[var(--button-active)] text-[var(--text-selected)] border-[1px] border-[var(--border)]'
                      : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'
                }`}
                  onClick={hasJoined ? handleLeave : handleJoin}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  disabled={loading || waiting}
                >
                  {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                </button>
              )}

              <div className=''>
                {' '}
                {hasJoined &&
                  (!privacy || (group && (group.role === 'admin' || group.role === 'creator'))) && (
                    <div className='relative'>
                      <button
                        disabled={loading || waiting}
                        className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-base lg:text-base my-4
     `}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && groupId && (
                        <div className='lg:absolute top-10 right-[400px]'>
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
            {group && (
              <div className='flex flex-row justify-center lg:gap-2 xl:gap-4 2xl:gap-8 mb-5'>
                <div className='flex flex-col'>
                  <p className=' text-xl flex justify-center'>
                    {formatNumber(group.numberOfPostsApproved)}
                  </p>
                  <p className='text-[var(--text-title)] text-base flex justify-center'>Posts</p>
                </div>

                <div className='flex flex-col'>
                  <p className=' text-xl flex justify-center'>
                    {formatNumber(group.numberOfProjects)}
                  </p>
                  <p className='text-[var(--text-title)] text-base flex justify-center'>Projects</p>
                </div>

                <div className='flex flex-col'>
                  <p className=' text-xl flex justify-center'>
                    {formatNumber(Math.max(1, group.numberOfMembers))}
                  </p>
                  <p className='text-[var(--text-title)] text-base flex justify-center'>Members</p>
                </div>
              </div>
            )}

            <div className='flex gap-4 flex-col mx-4'>
              <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                {privacy ? (
                  <MdOutlinePublicOff className='text-3xl  flex-shrink-0' />
                ) : (
                  <MdOutlinePublic className='text-3xl  flex-shrink-0' />
                )}
                <p className='text-sm xl:text-base  text-left'>
                  {privacy
                    ? 'Content only visible to members.'
                    : 'This group is visible to everyone.'}
                </p>
              </div>
              <div className='flex justify-center items-center flex-row sm:mx-2 lg:mx-6 gap-3'>
                {moderation ? (
                  <TbFlag className='text-4xl  flex-shrink-0' />
                ) : (
                  <TbFlagOff className='text-3xl  flex-shrink-0' />
                )}
                <p className='text-sm xl:text-base  text-left'>
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

      <div className='flex lg:invisible' ref={quickNavRef}>
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
            onProjectCreated={refetchPosts}
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

