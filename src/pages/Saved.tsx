import { useState, useEffect, useRef,useCallback } from 'react';
import ButtonShare from '../components/buttonShare';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import NothingPost from '../components/nothingPost';
import CollapseMenu from '../components/collapseMenu';

interface FileData {
  id: number;
  name: string;
  content: string;
}

interface PostData {
  postID: number;
  userId: number;
  displayName: string;
  avatar: string;
  createat: string;
  updateat: string;
  tags: number[];
  title: string;
  content: string;
  comments: number;
  files: FileData[];
  likes: number;
  liked: boolean;
  saved: boolean;
}

function Saved() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'taglist' | null>(null);

  // Refs for sidebar, tag list, and buttons
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleTagList = () => {
    setActiveComponent((prev) => (prev === 'taglist' ? null : 'taglist'));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        // Check if the click is outside all tracked elements
        !sidebarRef.current?.contains(target) &&
        !tagListRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !tagListButtonRef.current?.contains(target)
      ) {
        setActiveComponent(null);
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

 const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const response = await axios.get("/posts", {
        params: { page, limit: 10 },
      });
      const newPosts = response.data.posts;
      const hasNextPage = response.data.hasNextPage;

      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setHasMore(hasNextPage);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Infinite scroll logic using IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        fetchPosts();
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    const currentObserver = observer.current;
    currentObserver.observe(sentinelRef.current);

    return () => {
      if (currentObserver && sentinelRef.current) {
        currentObserver.unobserve(sentinelRef.current);
      }
    };
  }, [fetchPosts, hasMore, loading]);

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
    <ButtonShare/>

    {/*nothingpost*/}

<NothingPost />
      {/* Sidebar */}
            <div id="posts-container">
        {posts.map((post) => (
          <div key={post.postID} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      <div ref={sentinelRef} style={{ height: "50px" }} />
      {!hasMore && <p>No more posts to load.</p>}
      <div ref={sidebarRef}>
        <Sidebar isOpen={activeComponent === 'sidebar'} state={2} onClose={() => setActiveComponent(null)} />
      </div>

      {/* Tag List */}
      <div ref={tagListRef}>
        <TagList isOpen={activeComponent === 'taglist'} onClose={() => setActiveComponent(null)} />
      </div>

      {/* Toggle Buttons */}
      <CollapseMenu
        isSidebarOpen={activeComponent === 'sidebar'}
        isTagListOpen={activeComponent === 'taglist'}
        onToggleSidebar={toggleSidebar}
        onToggleTagList={toggleTagList}
        sidebarButtonRef={sidebarButtonRef}
        tagListButtonRef={tagListButtonRef}
      />
    </div>
  );
}

export default Saved;

