import { useState, useEffect, useRef } from 'react';
import ButtonShare from '../components/buttonShare';
import Sidebar from '../components/sidebar';
import TagList from '../components/tagList';
import NothingPost from '../components/nothingPost';
import PostBrief from '../components/postBrief';
import CollapseMenu from '../components/collapseMenu';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { Post, fetchPosts } from '../services/postService';

type PostType = 'stored' | 'me' | undefined;

interface Params extends Record<string, string | undefined> {
  type: PostType;
}

function Feed() {
  const [activeComponent, setActiveComponent] = useState<'sidebar' | 'taglist' | null>(null);
  const { type } = useParams<Params>();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const tagListRef = useRef<HTMLDivElement>(null);
  const sidebarButtonRef = useRef<HTMLButtonElement>(null);
  const tagListButtonRef = useRef<HTMLButtonElement>(null);

  // Tag, search, sorting, and criteria states
  const { userId } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [criteria, setCriteria] = useState<'date' | 'likes' | 'comments'>('date');

  const toggleSidebar = () => {
    setActiveComponent((prev) => (prev === 'sidebar' ? null : 'sidebar'));
  };

  const toggleTagList = () => {
    setActiveComponent((prev) => (prev === 'taglist' ? null : 'taglist'));
  };

  // State for posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Effect to fetch posts whenever necessary values change
  useEffect(() => {
    const fetchAndUpdatePosts = async () => {
      try {
        setLoading(true);
        const postsResponse = await fetchPosts(
          userId || '',
          page, // Pagination: dynamic page number
          10, // Limit: 10 posts per page
          order,
          criteria,
          searchTerm,
          selectedTags,
          type,
        );
        setPosts((prevPosts) => [...prevPosts, ...postsResponse.posts]); // Append new posts
        setHasMore(postsResponse.hasMore); // Assuming this is part of the response
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Error fetching posts!');
        setLoading(false);
      }
    };

    fetchAndUpdatePosts();
  }, [order, criteria, searchTerm, selectedTags, type, page]);

  // Handle infinite scroll logic
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1); // Increment page for infinite scroll
      }
    };

    observer.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    });

    const currentObserver = observer.current;
    currentObserver.observe(sentinelRef.current);

    return () => {
      if (currentObserver && sentinelRef.current) {
        currentObserver.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading]);

  // Handle click outside to close sidebars and taglist
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !sidebarRef.current?.contains(target) &&
        !tagListRef.current?.contains(target) &&
        !sidebarButtonRef.current?.contains(target) &&
        !tagListButtonRef.current?.contains(target)
      ) {
        setActiveComponent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle filter changes in TagList
  const handleFilterChange = (filters: {
    selectedTags: string[];
    sortBy: string;
    order: string;
    searchQuery: string;
  }) => {
    setSelectedTags(filters.selectedTags);
    setSearchTerm(filters.searchQuery);
    setOrder(filters.order as 'ascending' | 'descending');
    setCriteria(filters.sortBy as 'date' | 'likes' | 'comments');
    setPage(1); // Reset to page 1 when filters change
    setPosts([]); // Clear the posts before refetching
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      <ButtonShare />

      <NothingPost />

      <div id='posts-container'>
        {posts.map((post) => (
          <div key={post._id} className='post'>
            <PostBrief postData={post} />
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      <div ref={sentinelRef} style={{ height: '50px' }} />
      {!hasMore && <p>No more posts to load.</p>}
      <div ref={sidebarRef}>
        <Sidebar
          isOpen={activeComponent === 'sidebar'}
          state={type}
          onClose={() => setActiveComponent(null)}
        />
      </div>

      <div ref={tagListRef}>
        <TagList
          isOpen={activeComponent === 'taglist'}
          onClose={() => setActiveComponent(null)}
          onFilterChange={handleFilterChange}
        />
      </div>

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

export default Feed;
