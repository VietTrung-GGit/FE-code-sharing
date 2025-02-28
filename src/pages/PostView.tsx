import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import Sidebar from '../components/sidebar';
import PostBrief from '../components/postBrief';
import QuickNav from '../components/quickNav';
import CollapseMenu from '../components/collapseMenu';
import { useAuthUser } from '../context/AuthUserContext';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Post, fetchPostDetail } from '../services/postService';
import LoadingSpinner from '../components/loadingAnimate';
import { toast } from 'react-toastify';
import PostCreate from '../components/postCreate';
import { useTheme } from '../context/ThemeContext';

function PostView() {
  const { postId } = useParams<{ postId: string }>();
  const { theme } = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;

      try {
        setLoading(true);
        const data = await fetchPostDetail(postId);
        setPost(data);
        setLoading(false);
        console.log(data); // Log the fetched data directly
      } catch (error) {
        toast.error('Failed to load post');
      }
    };

    fetchData();
  }, [postId]);

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

  const [loading, setLoading] = useState(false);
  const dropdownConfigRef = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleQuickNav = () => {
    setActiveComponent((prev) => (prev === 'quicknav' ? null : 'quicknav'));
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
    <div className='bg-[var(--background)] text-[var(--text)]  relative min-h-screen flex flex-col w-full pt-16'>
      <div className='mb-5'>
        <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
          {showPostCreate && (
            <div className='flex items-center justify-center fixed inset-0 bg-black bg-opacity-50 flex z-50'>
              <PostCreate closeModal={handleCloseModal} {...(refId ? { postRefId: refId } : {})} />
            </div>
          )}
        </div>
      </div>

      {/* Show LoadingSpinner during the first load */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>{post && <PostBrief postData={post} shareAction={handleShare} />}</>
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

export default PostView;

