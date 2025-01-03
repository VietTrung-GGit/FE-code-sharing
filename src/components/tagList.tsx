import { useState, useEffect } from 'react';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
interface Tag {
  id: number;
  name: string;
}

function TagList({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const tags: Tag[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Health' },
    { id: 3, name: 'Education' },
    { id: 4, name: 'Entertainment' },
    { id: 5, name: 'Science' },
    { id: 6, name: 'Sports' },
  ];

  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const handleButtonClick = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  // Mock backend call: Replace with actual backend integration
  useEffect(() => {
    if (selectedTags.length === 0) return;

    const fetchFilteredPosts = async () => {
      try {
        const response = await fetch('/api/posts/filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: selectedTags }),
        });
        const data = await response.json();
        console.log('Filtered posts:', data); // Replace with state update for posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchFilteredPosts();
  }, [selectedTags]);

  return (
    <div
      className={`top-0 right-0 bg-Background/Bottom text-center w-60 h-3/4 pt-4 pl-4 min-h-64 rounded-b-3xl mt-8 fixed border-Primary/Dark border-solid box-border border-2 z-40
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    lg:translate-x-0 sm:static sm:max-xl:w-60 xl:max-2xl:w-64 sm:max-xl:pl-4 xl:max-2xl:pl-6 lg:max-2xl:mr-6 sm:max-2xl:fixed sm:max-lg:rounded-b-3xl lg:max-2xl:rounded-3xl`}
    >
      <div className='mb-4 mt-2'>
      <div className='w-8 inline-block fixed left-6'><img src={Search} alt='Search icon'></img></div>
      <div className='ml-2 sm:max-xl:ml-2 xl:max-2xl:-ml-2'>
        <input className='rounded-3xl text-left bg-Background/Middle text-Primary/Light text-xl placeholder-Primary/Light w-40 pl-2 sm:max-xl:pl-2 xl:max-2xl:pl-3' placeholder='Search...'></input>
      </div>
      </div>

      <div className='mb-4'>
      <div className='w-8 inline-block fixed left-6'>
      <img src={Filter} alt='Fliter icon'></img>
      </div>
      <div className='w-28 -ml-6 inline-block sm:max-xl:-ml-6 xl:max-2xl:-ml-8'>
        <p className='text-left text-Primary/Light text-xl'>Filter by tags:</p>
      </div>
      </div>
      
      <div className="text-left">
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="w-24 my-2 mr-2"
            onClick={() => handleButtonClick(tag.id)}
          >
            <div className="flex flex-col">
              <div
                className={`${
                  selectedTags.includes(tag.id) ? 'bg-Primary/Dark' : 'bg-Primary/Light'
                } rounded-3xl p-1`}
              >
                <p
                  className={`${
                    selectedTags.includes(tag.id) ? 'text-Primary/Light' : 'text-Primary/Dark'
                  }`}
                >
                  {tag.name}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagList;

