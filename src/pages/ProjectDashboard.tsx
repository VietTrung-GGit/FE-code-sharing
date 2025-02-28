import { useState, useEffect, useRef } from 'react';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { BiSolidEdit } from 'react-icons/bi';
import ProjectBoard from '../components/projectBoard';
import { useDebounce } from '@uidotdev/usehooks';
import Search from '../assets/search.svg';
import UserBrief from '../components/userBrief';
import Filter from '../assets/filter.svg';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import GroupBrief from '../components/groupBrief';
import ProjectBrief from '../components/projectBrief';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlineUsergroupDelete } from 'react-icons/ai';
import LoadingSpinner from '../components/loadingAnimate';
import PostCreate from '../components/postCreate';
import { Link } from 'react-router-dom';
import GroupCreate from '../components/groupCreate';
import ProjectCreate from '../components/projectCreate';
import AddMember from '../components/addMember';
import { usePinned } from '../context/PinnedContext';
import {
  ProjectDataBrief,
  fetchGroupProjects,
  getProjectFullData,
  ProjectData,
  joinProject,
  leaveProject,
  deleteProject,
} from '../services/projectService';
import { Post, fetchSectionPosts } from '../services/postService';
import {
  UserBriefData,
  fetchGroupMembers,
  fetchProjectUsers,
  fetchSectionUsers,
} from '../services/userService';
import { TbPin, TbPinnedOff } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';
import NothingPost from '../components/nothingPost';
import { MdOutlineSearch } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa';

interface ProjectDashboardProps {
  viewMember: boolean;
  viewParticipant?: boolean;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ viewMember, viewParticipant }) => {
  // const { user } = useUser();
  const { projectId } = useParams<{ projectId: string }>();
  const { sectionId } = useParams<{ sectionId: string }>();
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
  const [searchParams] = useSearchParams();
  const { pin, isPinned, unPin } = usePinned();
  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserBriefData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [privacy, setPrivacy] = useState(false);
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
  const [showInvite, setShowInvite] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  const [activeSection, setActiveSection] = useState('root');
  const alreadyPinned = projectId ? isPinned('project', projectId) : false;
  const [pinned, setPinned] = useState(alreadyPinned);
  const handlePinToggle = () => {
    if (projectId) {
      if (pinned) {
        unPin(undefined, projectId);
      } else {
        pin('project', projectId);
      }
      setPinned((prev) => !prev);
    }
  };
  // const fetchAndUpdatePosts = async () => {
  //   setLoading(true);
  //   try {
  //     console.log('Debounced search term call:', debouncedSearchTerm);
  //     const postsResponse = await fetchSectionPosts(
  //       activeSection,
  //       page,
  //       6, // Limit: 6 posts per page
  //       debouncedOrder,
  //       debouncedCriteria,
  //       debouncedSearchTerm,
  //       debouncedSelectedTags,
  //     );

  //     setHasMore(postsResponse.hasMore);
  //     setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]);
  //     setLoading(false);
  //     setFirstLoad(false);
  //   } catch (error) {
  //     console.error('Error fetching posts:', error);
  //   }
  // };
  // useEffect(() => {
  //   setPage(1);
  //   setPosts([]);
  //   setHasMore(true);
  //   fetchAndUpdatePosts();
  // }, [debouncedSearchTerm, debouncedSelectedTags, debouncedOrder, debouncedCriteria]);

  // useEffect(() => {
  //   if (hasMore && !firstLoad) {
  //     console.log('2');

  //     fetchAndUpdatePosts();
  //   }
  // }, [page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    // Reset the corresponding data array
    if (!viewMember && !viewParticipant) setPosts([]);
    if (viewMember) setUsers([]);
    if (!viewMember && viewParticipant) setUsers([]);

    // Fetch data based on active filter
    if (!viewMember && !viewParticipant) fetchAndUpdatePosts();
    if (viewMember) fetchAndUpdateMembers();
    if (!viewMember && viewParticipant) fetchAndUpdateParticipants();
  }, [viewMember, viewParticipant, activeSection, debouncedSearchTerm, searchParams]);

  useEffect(() => {
    if (sectionId) {
      setActiveSection(sectionId);
    }
    if (!viewMember && !viewParticipant) {
      navigate(`/project/${projectId}/sections/${sectionId || 'root'}/posts`);
    }
  }, [sectionId]);

  useEffect(() => {
    if (hasMore) {
      if (!viewMember && !viewParticipant) fetchAndUpdatePosts();
      if (viewMember) fetchAndUpdateMembers();
      if (!viewMember && viewParticipant) fetchAndUpdateParticipants();
    }
  }, [page]);

  const fetchAndUpdatePosts = async () => {
    if (projectId) {
      setLoading(true);
      try {
        console.log('Debounced search term call:', debouncedSearchTerm);
        const postsResponse = await fetchSectionPosts(
          activeSection,
          projectId,
          page,
          6, // Limit: 6 posts per page
          (searchParams.get('order') as 'ascending' | 'descending') || 'descending',
          (searchParams.get('criteria') as string) || 'date',
          'all',
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

  const fetchAndUpdateMembers = async () => {
    if (projectId) {
      setLoading(true);
      try {
        const usersResponse = await fetchProjectUsers(
          projectId,
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

  const fetchAndUpdateParticipants = async () => {
    if (projectId) {
      setLoading(true);
      try {
        const usersResponse = await fetchSectionUsers(
          activeSection,
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

  useEffect(() => {
    if (!viewMember && !viewParticipant && !sectionId) {
      navigate(`/project/${projectId}/sections/root`);
    }
  }, [viewMember, viewParticipant, navigate]);

  const handleFilterChange = (querySortParam: string) => {
    navigate(`/project/${projectId}/${activeSection}/posts?${querySortParam}`);
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
    // fetchAndUpdatePosts();
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchprojectData = async () => {
      try {
        const data = await getProjectFullData(projectId);
        setProject(data);
        setHasJoined(data.joined);

        // Handle avatar file if needed
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchprojectData();
  }, [projectId]);

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

  const handleJoin = async () => {
    if (project && project.canJoin && projectId) {
      try {
        setHasJoined(true);
        await joinProject(projectId);
        toast.success(`Joined project: ${project.name}`);
      } catch (error) {
        setHasJoined(false);
        toast.error('Failed to join project');
      }
    }
  };

  const handleLeave = async () => {
    if (project && projectId) {
      try {
        setHasJoined(false);
        await leaveProject(projectId);
        toast.info(`Left project: ${project.name}`);
      } catch (error) {
        setHasJoined(true);
        toast.error('Failed to leave project');
      }
    }
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

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };
  const { theme } = useTheme();
  return (
    <div className='bg-[var(--background)] text-[var(--text)]  relative min-h-screen flex flex-col w-full'>
      <>
        <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
          <div className='bg-Background/Bottom  justify-center w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px]  xl:h-[400px] lg:h-[400px] sm:h-[420px] h-[560px] border-Primary/Dark border-2 rounded-3xl lg:p-5 relative flex items-center'>
            {project && (project.role == 'leader' || project.role == 'admin') && (
              <div className=' absolute right-3 top-2' ref={dropdownConfigRef}>
                <button
                  onClick={toggleDropdownConfig}
                  className='hover:text-gray-300  text-3xl mx-[calc(10vw-2.2rem)] xsm:mx-[calc(10vw-2.6rem)] sm:mx-[calc(10vw-3.4rem)] lg:mx-[calc(10vw-5.2rem)] xl:mx-[calc(10vw-6.8rem)]'
                >
                  <IoIosMore />
                </button>
                {isDropdownConfigOpen && (
                  <div className='absolute -right-10 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 bg-Background/Bottom border rounded-xl border-2 border-Primary/Dark shadow-lg z-10'>
                    <ul className=' py-2 text-sm'>
                      <li>
                        {projectId && (
                          <button
                            className='block px-4 py-2 w-full text-left flex items-center gap-4 rounded hover:bg-Background/Middle transition'
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
                      {projectId && (project.role == 'admin' || project.role == 'leader') && (
                        <>
                          {' '}
                          <li>
                            <button
                              className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                              onClick={() => {
                                setShowProjectEdit((prev) => !prev);
                              }}
                            >
                              <BiSolidEdit className='text-lg lg:text-xl' />
                              Edit project profile
                            </button>
                          </li>
                        </>
                      )}
                      {projectId && project.role == 'leader' && (
                        <li>
                          <button
                            className='block px-4 py-2  hover:bg-Background/Middle w-full text-left flex flex-row gap-4'
                            onClick={async () => {
                              try {
                                await deleteProject(projectId);
                                navigate(`/group/${project.group}`);
                                toast.success('Project deleted successfully');
                                // Optionally, you can navigate away or update state after deletion
                              } catch (error) {
                                toast.error('Failed to delete project');
                                console.error(error);
                              }
                            }}
                          >
                            <AiOutlineUsergroupDelete className='text-lg lg:text-xl' />
                            Delete project
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {showProjectEdit && (
                  <div className='fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50'>
                    <ProjectCreate
                      projectData={project}
                      projectId={projectId}
                      closeModal={() => {
                        setShowProjectEdit(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className='flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-6 xl:space-x-2 mt-10 xsm:mt-8 sm:-mt-2 lg:-mt-1 mb-44 xsm:mb-48 sm:mb-0 lg:-ml-2 xl:-ml-4'>
              <div className='sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
                <img
                  src={project?.avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                  alt='Profile Icon'
                  className='w-16 h-16 xxsm:w-28 xxsm:h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-56 xl:w-56 rounded-full object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
                />
                <div className='flex hidden sm:block -mt-2'>
                  <button
                    className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-32 lg:w-28 h-7 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target sm:my-2 
        ${hasJoined ? 'bg-Accent/Target  hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:'}`}
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
    bg-white text-Accent/Target`}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && projectId && (
                        <div className='absolute top-12 right-20'>
                          {' '}
                          <AddMember
                            type='project'
                            desId={projectId}
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

                    {project && project?.members?.length > 0 && (
                      <div className='flex space-x-1'>
                        {project.members.map(({ avatar, user }, index) => (
                          <img
                            key={user || index} // Prefer `user` as a unique key if available
                            src={avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                            alt={`Member: ${user || `Unknown ${index + 1}`}`}
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
                      <p className=' font-semibold mt-6 text-2xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                        {project?.name || 'project Name'}
                      </p>
                      <div className='flex flex-row block xsm:mt-2 lg:hidden lg:static'>
                        {project && project?.members?.length > 0 && (
                          <div className='flex space-x-1'>
                            {project.members.map(({ avatar, user }, index) => (
                              <img
                                key={user || index} // Prefer `user` as a unique key if available
                                src={avatar || 'https://i.postimg.cc/02Xx40Yq/default.png'}
                                alt={`Member: ${user || `Unknown ${index + 1}`}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`transition-colors font-semibold sm:hidden duration-300 ease-in-out w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target my-1 xsm:my-2 mt-2 xsm:mt-4
        ${hasJoined ? 'bg-Accent/Target  hover:bg-red-400' : 'bg-white hover:bg-Accent/Target hover:'}`}
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
                         bg-white text-Accent/Target`}
                          onClick={() => setShowInvite((prev) => !prev)}
                        >
                          Invite
                        </button>
                        {showInvite && projectId && (
                          <div className='absolute top-12 right-[300px]'>
                            {' '}
                            <AddMember
                              type='project'
                              desId={projectId}
                              isOpen={showInvite}
                              closeModal={() => setShowInvite(false)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className='bg-[var(--input)] sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] xsm:h-1/2 sm:h-full rounded-3xl absolute xsm:top-52 xsm:inset-x-8 top-48 inset-x-4 sm:static'>
                  <p className='p-4'>{project?.bio || 'Group Description'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex justify-center mt-8 sm:max-lg:mt-6 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
          <div className='flex flex-row justify-center gap-32 w-1/2'>
            <button
              className={`${!viewMember ? 'text-gray-500' : ''} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/project/${projectId}/sections/root`)}
            >
              Overview
            </button>
            <button
              className={`${viewMember ? 'text-gray-500' : ''} text-xl font-semibold whitespace-nowrap`}
              onClick={() => navigate(`/project/${projectId}/members`)}
            >
              Members
            </button>
          </div>
        </div>
        <div className='flex lg:justify-center mt-2 xsm:mt-2 sm:max-lg:mt-4 lg:mt-2 mx-6 sm:max-lg:mx-20 lg:mx-20'>
          <div className=' flex w-1/2 ml-8 sm:ml-0'>
            <p className='text-2xl font-semibold '>{`${viewMember ? 'Members' : 'Sections'}`}</p>
          </div>
        </div>
      </>

      {project && projectId && !viewMember && sectionId && (
        <>
          <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
            <ProjectBoard
              sections={project.sections}
              projectId={projectId}
              activeSectionId={sectionId}
            />
          </div>

          <div className='mx-7 xsm:mx-8 sm:mx-14 lg:mx-0 mt-4 sm:mt-4 lg:mt-0 lg:absolute top-[610px] right-4'>
            <div
              className={`bg-[var(--background-side)]  border-2 border-[var(--border)] bg-center bg-cover  sm:h-64 lg:h-[360px]   px-6 py-6 w-full flex flex-col rounded-3xl lg:w-[19vw] sm:max-lg:rounded-3xl  lg:mt-2 lg:rounded-3xl
        border-solid box-border `}
            >
              <div className='flex flex-row gap-6'>
                <p className='text-xl font-semibold  text-left mb-2'>Notes</p>
                <button className='  text-left flex'>
                  <BiSolidEdit className='text-2xl mt-1' />
                </button>
              </div>
              <input
                className='bg-Background/Middle h-[280px] w-96  rounded-3xl w-full p-4'
                placeholder='Notes to be displayed...'
              ></input>
            </div>
          </div>

          <div className='mb-5 lg:flex lg:justify-center px-8 xsm:px-8 sm:px-14 lg:px-8'>
            <div
              className='flex justify-start flex-row mt-8 lg:mt-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[720px]'
              ref={dropdownFilterRef}
            >
              <button
                className='text-lg bg-Primary/Light text-Primary/Dark rounded-3xl font-semibold  py-1 w-40 flex flex-row items-center justify-center'
                onClick={toggleDropdownFilter}
              >
                {`${viewParticipant ? 'Participants' : 'Posts'}`}
                <div className='ml-2'>
                  <IoMdArrowDropdown className='text-3xl' />
                </div>
              </button>
            </div>
          </div>
          {isDropdownFilterOpen && (
            <div className='absolute left-[400px] top-[1110px] w-40 bg-white border rounded-3xl shadow-lg z-10'>
              <ul className='py-1 my-3 ml-2'>
                <li>
                  <button
                    className={`block px-4 py-2 text-lg text-Primary/Dark font-semibold ${!viewParticipant ? 'bg-Primary/Light' : 'hover:bg-gray-300 bg-white'} w-36 text-left flex flex-row gap-4 rounded-3xl`}
                    onClick={() => navigate(`/project/${projectId}/sections/${sectionId}/posts`)}
                  >
                    Posts
                  </button>
                </li>
                <li>
                  <button
                    className={`block px-4 py-2 text-lg text-Primary/Dark font-semibold ${viewParticipant ? 'bg-Primary/Light' : 'hover:bg-gray-300 bg-white'} w-36 text-left flex flex-row gap-4 rounded-3xl`}
                    onClick={() =>
                      navigate(`/project/${projectId}/sections/${sectionId}/participants`)
                    }
                  >
                    Participants
                  </button>
                </li>
              </ul>
            </div>
          )}
          {(project.role == 'admin' || project.role == 'leader') && activeSection != 'root' && (
            <div className='relative'>
              <button
                className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-32 lg:w-28 h-7 px-[2px] rounded-xl text-xs md:text-md lg:text-base text-Accent/Target sm:my-2
   bg-white text-Accent/Target`}
                onClick={() => setShowAddParticipant((prev) => !prev)}
              >
                Invite
              </button>
              {setShowAddParticipant && (
                <div className='absolute top-12 right-20'>
                  {' '}
                  <AddMember
                    type='section'
                    desId={activeSection}
                    isOpen={showAddParticipant}
                    closeModal={() => setShowAddParticipant(false)}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className='flex justify-center mt-0 sm:max-lg:mt-0 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom border-2  border-Primary/Dark'
              : 'bg-[var(--surface)]'
          } h-18  px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl
        border-solid box-border mb-3 text-center `}
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
              placeholder={`Search for ${viewMember ? 'Members' : viewParticipant ? 'Participants' : 'Posts'}`}
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
                      activeFilter={!viewMember && !viewParticipant ? 'Posts' : 'Users'} //change according to the button option, posts as default
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

        {showPostCreate && (
          <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
            <PostCreate
              closeModal={handleCloseModal}
              onPostCreated={refetchPosts}
              mode={activeSection == 'root' ? 2 : 3}
              desId={activeSection == 'root' ? projectId : activeSection}
              parentId={activeSection !== 'root' ? projectId : undefined}
              role={project?.role} // Cleaner way to pass `role` if `group` exists
              postRefId={refId || undefined} // Ensures it's only passed when defined
            />
          </div>
        )}
      </div>
      {!viewMember && !viewParticipant && (
        <>
          <div className='mb-5'>
            <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
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
                    <p className='text-left  text-l overflow-hidden'>Share your code...</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Show NothingPost only after the first load, no posts, and not loading */}
          {!loading && posts.length === 0 && <NothingPost />}

          {/* Display posts if available */}
          {posts.length > 0 && project && (
            <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
              {posts.map((post) => (
                <div key={post._id} className='post'>
                  <PostBrief postData={post} shareAction={handleShare} role={project.role} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Display posts if available */}
      {(viewMember || (viewParticipant && project)) && (
        <div id='users-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
          {users.map((u) => (
            <div key={u._id}>
              <UserBrief userData={u} project={projectId} role={project?.role} />
            </div>
          ))}
        </div>
      )}

      {/* Show LoadingSpinner during additional data fetching */}
      {loading && <LoadingSpinner />}
      {/*
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

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

export default ProjectDashboard;

