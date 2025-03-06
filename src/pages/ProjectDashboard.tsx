import { useState, useEffect, useRef } from 'react';
import { IoIosMore, IoIosMail, IoMdArrowDropdown } from 'react-icons/io';
import { MdOutlinePublicOff, MdOutlinePublic, MdGroupRemove } from 'react-icons/md';
import { BiSolidEdit } from 'react-icons/bi';
import ProjectBoard from '../components/projectBoard';
import { useDebounce } from '@uidotdev/usehooks';
import UserBrief from '../components/userBrief';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import PostBrief from '../components/postBrief';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlineUsergroupDelete } from 'react-icons/ai';
import LoadingSpinner from '../components/loadingAnimate';
import PostCreate from '../components/postCreate';
import { Link } from 'react-router-dom';
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
  ProjectDataCreate,
  getSectionDescription,
  updateSection,
  updateProjectNote,
} from '../services/projectService';
import { Post, fetchSectionPosts } from '../services/postService';
import { UserBriefData, fetchProjectUsers, fetchSectionUsers } from '../services/userService';
import { TbPin, TbPinnedOff } from 'react-icons/tb';
import { useTheme } from '../context/ThemeContext';
import NothingPost from '../components/nothingPost';
import { MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineSearch } from 'react-icons/md';
import { FaFilter } from 'react-icons/fa';
import { formatNumber } from '../utils/helpers';

interface ProjectDashboardProps {
  viewMember: boolean;
  viewParticipant?: boolean;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ viewMember, viewParticipant }) => {
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
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [privacy, setPrivacy] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true); // To track the initial load
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');
  const [isDropdownConfigOpen, setIsDropdownConfigOpen] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);
  const [isDropdownFilterOpen, setIsDropdownFilterOpen] = useState(false);
  const dropdownFilterRef = useRef<HTMLDivElement>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 600);
  const [viewSubsections, setViewSubsections] = useState(false);
  const [activeSection, setActiveSection] = useState('root');
  const alreadyPinned = projectId ? isPinned('project', projectId) : false;
  const [pinned, setPinned] = useState(alreadyPinned);
  const [waiting, setWaiting] = useState(false);

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

  const handleIsParticipant = (belonged: boolean) => {
    setIsParticipant(belonged);
  };

  useEffect(() => {
    if (hasJoined || !privacy) {
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
    }
  }, [
    hasJoined,
    privacy,
    viewMember,
    viewParticipant,
    activeSection,
    debouncedSearchTerm,
    searchParams,
    viewSubsections,
  ]);

  useEffect(() => {
    if (sectionId) {
      setActiveSection(sectionId);
    }
  }, [sectionId]);

  useEffect(() => {
    setNote('Loading...');
    if (activeSection) {
      fetchNote();
    }
  }, [activeSection]);

  const fetchNote = async () => {
    try {
      if (activeSection !== 'root') {
        const data = await getSectionDescription(activeSection);
        setNote(data);
      } else if (project) {
        setNote(project.note);
      }
    } catch (error) {
      console.error('Failed to fetch note:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      setWaiting(true);
      if (activeSection != 'root') {
        await updateSection(activeSection, undefined, note);
      } else if (projectId) {
        await updateProjectNote(projectId, note);
      }
      setWaiting(false);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update note:', error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMore) {
      if (!viewMember && !viewParticipant) fetchAndUpdatePosts();
      if (viewMember) fetchAndUpdateMembers();
      if (!viewMember && viewParticipant) fetchAndUpdateParticipants();
    }
  }, [page]);
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [prevNote, setPrevNote] = useState(note);
  const handleEdit = () => {
    setPrevNote(note); // Save the current note before editing
    setIsEditing(true);
  };
  const handleQuit = () => {
    setNote(prevNote); // Revert to the previous value
    setIsEditing(false);
  };

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
          viewSubsections ? 'all' : 'only',
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

  const toggleSubsections = () => {
    setViewSubsections((prev) => !prev);
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
    setUsers([]);
    setHasMore(true);
    setFirstLoad(true);
    if (!viewMember && !viewParticipant) {
      fetchAndUpdatePosts();
    } else if (!viewMember && viewParticipant) {
      fetchAndUpdateParticipants();
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const fetchprojectData = async () => {
      try {
        const data = await getProjectFullData(projectId);
        setProject(data);
        if (activeSection === 'root') {
          setNote(data.note);
        }

        setHasJoined(data.joined);
        setPrivacy(!data.canJoin);
        setLoading(false);
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
        setWaiting(true);
        setHasJoined(true);
        await joinProject(projectId);
        setWaiting(false);
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
        setWaiting(true);
        await leaveProject(projectId);
        setWaiting(false);
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

  const refreshProject = (progroup: ProjectDataCreate) => {
    setProject(
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
              role: prevGroup.role, // Keep unchanged
            }
          : prevGroup, // If prevGroup is null, return it as is
    );
    setPrivacy(progroup.private);
  };

  const handleCloseModal = () => {
    setShowPostCreate(false);
  };
  const { theme } = useTheme();
  return (
    <div className='bg-[var(--background)] text-[var(--text)]  relative min-h-screen flex flex-col w-full'>
      <div className='mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 mb-5 flex justify-center mt-28 lg:mt-16 '>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom text-white border-2'
              : 'bg-[var(--surface)] text-[var(--text)]'
          }  justify-center w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px]  xl:h-[400px] lg:h-[400px] sm:h-[420px] xxsm:h-[560px] h-[530px] border-Primary/Dark rounded-3xl lg:p-5 relative flex items-center`}
        >
          {project && (project.role == 'leader' || project.role == 'admin') && (
            <div className=' absolute right-3 top-2' ref={dropdownConfigRef}>
              <button
                onClick={toggleDropdownConfig}
                className='hover:text-[var(--text-hovered)]  text-3xl mx-[calc(10vw-2.2rem)] xsm:mx-[calc(10vw-2.6rem)] sm:mx-[calc(10vw-3.4rem)] lg:mx-[calc(10vw-5.2rem)] xl:mx-[calc(10vw-6.8rem)]'
              >
                <IoIosMore />
              </button>
              {isDropdownConfigOpen && (
                <div
                  className={`${
                    theme === 'original'
                      ? 'bg-Background/Bottom text-white'
                      : 'bg-[var(--surface)] text-[var(--text)]'
                  } border border-[var(--border)]  absolute -right-10 xsm:-right-10 sm:-right-[50px] lg:-right-40 w-40 md:w-52 rounded-xl shadow-lg z-10`}
                >
                  <ul className=' py-2 text-sm'>
                    <li>
                      {projectId && (
                        <button
                          className='block px-4 py-2 w-full text-left flex items-center gap-4 rounded hover:bg-[var(--background-hovered)]  transition'
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
                            className='block px-4 py-2  hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
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
                          className='block px-4 py-2  hover:bg-[var(--background-hovered)]  w-full text-left flex flex-row gap-4'
                          onClick={async () => {
                            try {
                              await deleteProject(projectId);
                              navigate(`/group/${project.group}/posts`);
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
                    refresh={refreshProject}
                    closeModal={() => {
                      setShowProjectEdit(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className='flex flex-row justify-center space-x-4 xsm:space-x-10 sm:space-x-6 xl:space-x-2 mt-10 xsm:mt-8 sm:mt-0 lg:-mt-1 mb-44 xsm:mb-48 sm:mb-0 lg:-ml-2 xl:-ml-4'>
            <div className='sm:-mt-10 lg:-mt-6 flex flex-col h-[380px] items-center'>
              <img
                src={project?.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                alt='Profile Icon'
                className='w-20 h-20 xxsm:w-28 xxsm:h-28 xsm:w-36 xsm:h-36 sm:w-52 sm:h-52 lg:w-48 lg:h-48 xl:h-52 xl:w-52 rounded-3xl object-cover mt-8 mx-0 sm:mx-0 sm:mt-14 lg:mx-2 xl:mx-4 mb-5 flex-shrink-0'
              />
              <div
                className={`sm:flex max-lg:gap-y-3 items-center gap-x-1 xl:gap-x-2 hidden mt-4 xl:-mt-3`}
              >
                {(!privacy || hasJoined) && project && project.role != 'leader' && (
                  <button
                    className={`transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-24 lg:w-24 xl:w-24 h-7 px-[2px] rounded-xl text-xs md:text-base lg:text-base text-Accent/Target lg:hidden
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

                {hasJoined &&
                  (!privacy ||
                    (project && (project.role === 'admin' || project.role === 'leader'))) && (
                    <div className='relative'>
                      <button
                        disabled={loading || waiting}
                        className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-24
                       lg:w-24 xl:w-24 h-7 px-[2px] rounded-xl text-xs md:text-base lg:text-base lg:hidden`}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && projectId && (
                        <div className='absolute top-12 right-20'>
                          <AddMember
                            type='project'
                            desId={projectId}
                            isOpen={showInvite}
                            closeModal={() => setShowInvite(false)}
                            refetchUsers={refetchPosts}
                          />
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <div className='flex items-center mt-2 lg:mt-0 xl:mt-5 space-x-2 hidden lg:block'>
                <div className='flex flex-row '>
                  {/* Avatar Members */}

                  {project && project?.members?.length > 0 && (
                    <div className='flex space-x-1'>
                      {project.members.slice(0, 4).map(({ avatar, user }, index) => (
                        <img
                          key={user || index} // Prefer `user` as a unique key if available
                          className='w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover'
                          src={avatar || import.meta.env.VITE_DEFAULT_AVATAR}
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
                  <div
                    className={`flex flex-col ${project && project.role == 'leader' ? 'xxsm:mt-4 xsm:max-sm:mt-6' : ''}`}
                  >
                    <p className=' font-semibold mt-6 text-2xl sm:text-3xl lg:text-2xl xl:text-3xl break-words'>
                      {project?.name || 'project Name'}
                    </p>
                    <div className='flex flex-row block xsm:mt-2 lg:hidden lg:static'>
                      {project && project?.members?.length > 0 && (
                        <div className='flex space-x-1'>
                          {project.members.slice(0, 4).map(({ avatar, user }, index) => (
                            <img
                              key={user || index} // Prefer `user` as a unique key if available
                              src={avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                              alt={`Member: ${user || `Unknown ${index + 1}`}`}
                              className='w-6 h-6 xxsm:w-8 xxsm:h-8 rounded-full object-cover'
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-row gap-x-2'>
                    {(!privacy || hasJoined) && project && project.role != 'leader' && (
                      <button
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
                        disabled={loading || waiting}
                      >
                        {hasJoined ? (isHovered ? 'Leave' : 'Joined') : 'Join'}
                      </button>
                    )}

                    {hasJoined &&
                      (!privacy ||
                        (project && (project.role === 'admin' || project.role === 'leader'))) && (
                        <div className='relative sm:hidden'>
                          <button
                            disabled={loading || waiting}
                            className={`${theme == 'original' ? 'bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'}  text-Accent/Target  transition-colors font-semibold duration-300 ease-in-out w-16 xxsm:w-20 h-5 xsm:h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-base lg:text-base my-2 xsm:my-2
                       `}
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
              </div>

              <div className='bg-[var(--input)] sm:w-[44vw] lg:w-[22vw] xl:w-[23vw] 2xl:w-[25vw] h-3/5 max-h-[300px] lg:max-h-[210px] xl:max-h-[220px] xsm:h-1/2 sm:h-[170px] lg:h-full rounded-3xl absolute xsm:top-52 xsm:inset-x-8 xxsm:top-48 top-40 inset-x-4 sm:static break-words overflow-hidden overflow-y-auto  scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent'>
                <p className='p-4'>{project?.bio || 'Project Description'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-center mx-8 xsm:mx-8 sm:max-lg:mx-14 lg:mx-8 lg:hidden'>
        <div
          className={` bg-center bg-cover h-40 bg-[var(--background-side)]  border-2 border-[var(--border)] px-2 xxsm:px-6 py-4 w-full flex items-center justify-center rounded-3xl lg:w-1/2 sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center mt-6 `}
        >
          <div className='flex flex-col items-center gap-y-0'>
            <div className='flex flex-row gap-4 xsm:gap-8 sm:gap-20 '>
              <div className='flex flex-col'>
                <p className=' text-xl flex justify-center'>{project?.numberOfPosts || 0}</p>
                <p className='text-[var(--text-title)] text-base sm:text-xl flex justify-center'>
                  Posts
                </p>
              </div>

              <div className='flex flex-col'>
                <p className=' text-xl flex justify-center'>{project?.numberOfMembers || 0}</p>
                <p className='text-[var(--text-title)] text-base sm:text-xl flex justify-center'>
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
            </div>
          </div>
        </div>
      </div>

      {hasJoined || !privacy ? (
        <>
          <div className='flex justify-center mt-8 sm:max-lg:mt-8 lg:mt-6 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
            <div className='flex flex-row justify-center gap-24 xxsm:gap-28 xsm:gap-32 w-1/2'>
              <button
                className={`${!viewMember ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} text-xl whitespace-nowrap`}
                onClick={() => navigate(`/project/${projectId}/sections/root/posts`)}
                disabled={loading || waiting}
              >
                Overview
              </button>
              <button
                className={`${viewMember ? 'text-Accent/Target' : 'hover:text-[var(--text-hovered)]'} text-xl whitespace-nowrap`}
                onClick={() => navigate(`/project/${projectId}/members`)}
                disabled={loading || waiting}
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

          {project && projectId && !viewMember && sectionId && (
            <>
              <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8 mb-4 lg:mb-2'>
                <ProjectBoard
                  sections={project.sections}
                  projectId={projectId}
                  activeSectionId={sectionId}
                  isAdmin={project.role !== 'member'}
                  showSubsections={viewSubsections}
                  onSectionOpend={handleIsParticipant}
                />
              </div>

              <div className='mx-7 xsm:mx-8 sm:mx-14 lg:mx-0 mt-4 sm:mt-4 lg:mt-0 lg:absolute top-[610px] right-4'>
                <div
                  className={`bg-[var(--background-side)] border-2 border-[var(--border)] bg-center bg-cover h-56 lg:h-[360px] px-6 py-6 w-full flex flex-col rounded-3xl lg:w-[19vw] sm:max-lg:rounded-3xl lg:mt-2 lg:rounded-3xl border-solid box-border`}
                >
                  <div className='flex flex-row gap-6 items-end justify-between mb-1'>
                    <p className='text-xl font-semibold text-left '>Notes</p>
                    {project.role !== 'member' &&
                      (!isEditing ? (
                        <button className='text-left flex' onClick={handleEdit}>
                          <BiSolidEdit className='text-2xl mb-[2px] hover:text-[var(--text-hovered)]' />
                        </button>
                      ) : (
                        <div className='flex gap-4'>
                          <button className='text-left flex text-gray-400' onClick={handleQuit}>
                            Quit
                          </button>
                          <button
                            className='text-left flex text-[var(--text-hovered)] hover:text-Accent/Target font-semibold'
                            onClick={handleSave}
                          >
                            Save
                          </button>
                        </div>
                      ))}
                  </div>
                  <textarea
                    className='bg-[var(--input)] h-full w-96 focus:outline-none rounded-2xl w-full p-4 resize-none scrollbar'
                    placeholder='Notes to be displayed...'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!isEditing}
                  ></textarea>
                </div>
              </div>

              <div className='mt-4 lg:mt-0 mb-4 flex justify-center px-8 xsm:px-8 sm:px-14 lg:px-8'>
                <div className='flex flex-row justify-center gap-24 xl:gap-32 w-1/2'>
                  <button
                    className={`block px-4 py-2 text-base sm:text-lg font-semibold ${!viewParticipant ? 'text-[var(--text-title)]' : 'text-white'} w-36 text-left flex flex-row gap-4 rounded-3xl`}
                    onClick={() => navigate(`/project/${projectId}/sections/${sectionId}/posts`)}
                    disabled={loading || waiting}
                  >
                    Posts
                  </button>
                  {activeSection != 'root' && (
                    <button
                      disabled={loading || waiting}
                      className={`block px-4 py-2 text-lg font-semibold ${viewParticipant ? 'text-[var(--text-title)]' : 'text-white'} w-36 text-left flex flex-row gap-4 rounded-3xl`}
                      onClick={() => {
                        navigate(`/project/${projectId}/sections/${sectionId}/participants`);
                      }}
                    >
                      Participants
                    </button>
                  )}

                  {/* {!viewMember && !viewParticipant && (
                    <div className='text-base font-semibold py-1 flex items-center justify-center gap-2 invisible'>
                      View Subsections Content
                      <button onClick={toggleSubsections}>
                        {' '}
                        {viewSubsections ? (
                          <MdCheckBox className='text-green-500 text-2xl' />
                        ) : (
                          <MdCheckBoxOutlineBlank className='text-2xl' />
                        )}
                      </button>
                    </div>
                  )} */}
                  {/* Subsections Button */}
                  {!viewMember && (
                    <div
                      className={`w-full text-sm sm:text-base font-semibold py-1 flex items-center justify-center gap-2 ${viewParticipant ? 'invisible' : ''}`}
                    >
                      View Subsections Content
                      <button onClick={toggleSubsections}>
                        {' '}
                        {viewSubsections ? (
                          <MdCheckBox className='text-green-500 text-2xl' />
                        ) : (
                          <MdCheckBoxOutlineBlank className='text-2xl' />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Invite Button (Only for Admins/Leaders in a section) */}
                  {((project && project.role === 'admin') || project.role === 'leader') &&
                    activeSection !== 'root' &&
                    !viewMember &&
                    viewParticipant && (
                      <div className='lg:relative'>
                        <button
                          className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target  transition-colors font-semibold duration-300 ease-in-out w-12 sm:w-32 lg:w-28 h-7 px-[2px] rounded-xl text-xs md:text-base lg:text-base sm:my-2`}
                          onClick={() => setShowAddParticipant((prev) => !prev)}
                          disabled={loading || waiting}
                        >
                          Invite
                        </button>

                        {showAddParticipant && (
                          <div className='lg:absolute lg:top-2 lg:left-0'>
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
                </div>
              </div>
            </>
          )}

          <div className='flex justify-center mt-0 sm:max-lg:mt-0 lg:mt-2 mx-6 sm:max-lg:mx-14 lg:mx-8 mb-5'>
            <div
              className={`${
                theme === 'original'
                  ? 'bg-Background/Bottom border-2  border-Primary/Dark'
                  : 'bg-[var(--surface)]'
              } h-18  px-6 py-4 w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl
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
                      ? 'bg-Background/Middle text-text-[var(--text-title)] '
                      : 'bg-[var(--input)] text-[var(--text)]'
                  } inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-base`}
                  placeholder={`Search for ${viewMember ? 'Members' : viewParticipant ? 'Participants' : 'Posts'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                ></input>

                <button
                  className='text-xl hover:bg-[var(--background-hovered)]  rounded-lg hover:bg-gray-300 hover:bg-opacity-20 block '
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
                          activeFilter={!viewMember && !viewParticipant ? 'Posts' : 'Users'} //change according to the button option, posts as default
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
          {!viewMember && !viewParticipant && (hasJoined || !privacy) && (
            <>
              {(isParticipant ||
                (project && (project.role == 'leader' || project.role == 'admin'))) && (
                <div className='mb-5'>
                  <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
                    <div
                      className={`${
                        theme === 'original'
                          ? 'bg-Background/Bottom border-2 border-Primary/Dark'
                          : 'bg-[var(--surface)] text-[var(--text)]'
                      } w-[94vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] my-3 border-Primary/Dark rounded-3xl p-5 md:p-7 lg:p-8`}
                    >
                      <div className='flex flex-row w-full items-center space-x-4'>
                        <div className='inline-block flex-shrink-0'>
                          <img
                            src={user?.avatar || import.meta.env.VITE_DEFAULT_AVATAR}
                            alt='Profile Icon'
                            className='w-[52px] h-[52px] rounded-full object-cover'
                          />
                        </div>
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
              )}

              {/* Show NothingPost only after the first load, no posts, and not loading */}
              {!loading && posts.length === 0 && <NothingPost />}

              {/* Display posts if available */}
              {posts.length > 0 && project && (
                <div id='posts-container' className={'mx-6 sm:max-lg:mx-14 lg:mx-10 '}>
                  {posts.map((post) => (
                    <div key={post._id} className='post'>
                      <PostBrief
                        postData={post}
                        deletable={project.role == 'admin' || project.role == 'leader'}
                        shareAction={handleShare}
                        detail={false}
                        role={project.role}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Display posts if available */}
          {viewMember && project && (
            <div id='users-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
              {users.map((u) => (
                <div key={u._id}>
                  <UserBrief userData={u} project={projectId} role={project?.role} />
                </div>
              ))}
            </div>
          )}

          {/* Display posts if available */}
          {!viewMember && viewParticipant && project && (
            <div id='users-container' className='mx-6 sm:max-lg:mx-14 lg:mx-10'>
              {users.map((u) => (
                <div key={u._id}>
                  <UserBrief userData={u} section={activeSection} role={project?.role} />
                </div>
              ))}
            </div>
          )}

          {/* Show LoadingSpinner during additional data fetching */}
          {loading && <LoadingSpinner />}
        </>
      ) : !loading ? (
        <div className='flex justify-center items-center h-[50vh]'>
          <p className='text-xl text-gray-500'>You need to join this project to see its content.</p>
        </div>
      ) : null}
      {/*
      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: '50px' }} />

      <div className=' absolute flex flex-col top-12 lg:right-2 xl:right-4 sm:max-lg:invisible invisible lg:visible'>
        <div className=' bg-cover rounded-3xl bg-[var(--background-side)]  border-2 border-[var(--border)] lg:w-[22vw] xl:w-[19vw] h-[400px] mt-4 ml-[3rem] lg:py-8 xl:py-8 '>
          <div className='flex flex-col lg:mt-6 xl:mt-4'>
            <div className='flex justify-center mx-2'>
              <p className=' text-xl font-semibold text-center break-words'>
                {project?.name || 'Project name'}
              </p>
            </div>
            <div className='flex justify-center gap-2'>
              {(hasJoined || !privacy) && project && project.role != 'leader' && (
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
                  (!privacy ||
                    (project && (project.role === 'admin' || project.role === 'leader'))) && (
                    <div className='relative'>
                      <button
                        disabled={loading || waiting}
                        className={`${theme == 'original' ? ' bg-white hover:text-white hover:bg-Accent/Target' : 'bg-[var(--button)] hover:bg-[var(--button-hovered)] border-[1px] border-[var(--border)]'} text-Accent/Target transition-colors font-semibold duration-300 ease-in-out w-12 md:w-20 lg:w-24 h-6 lg:h-8 px-[2px] rounded-xl text-xs md:text-base lg:text-base my-4
     `}
                        onClick={() => setShowInvite((prev) => !prev)}
                      >
                        Invite
                      </button>
                      {showInvite && projectId && (
                        <div className='lg:absolute top-10 right-[400px]'>
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
            {project && (
              <div className='flex flex-row justify-center lg:gap-8 xl:gap-10 2xl:gap-16 mb-5'>
                <div className='flex flex-col'>
                  <p className=' text-xl flex justify-center'>
                    {formatNumber(project.numberOfPosts)}
                  </p>
                  <p className='text-[var(--text-title)] text-base flex justify-center'>Posts</p>
                </div>

                <div className='flex flex-col'>
                  <p className=' text-xl flex justify-center'>
                    {formatNumber(Math.max(1, project.numberOfMembers))}
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
                    : 'This project is visible to everyone in its group.'}
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

