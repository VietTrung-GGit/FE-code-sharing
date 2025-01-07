import { useState, useEffect } from 'react';
import Search from '../assets/search.svg';
import Filter from '../assets/filter.svg';
import Descend from '../assets/descending.svg';
import Ascend from '../assets/ascending.svg';
import Date from '../assets/date.svg';
import DateClicked from '../assets/dateClicked.svg';
import Likes from '../assets/likes.svg';
import LikesClicked from '../assets/likesClicked.svg';
import Comments from '../assets/comments.svg';
import CommentsClicked from '../assets/commentsClicked.svg';
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


  const [activeButton, setActiveButton] = useState<'descending' | 'ascending' | null>('descending');
  const [methodButton, setMethodButton] = useState<'likes' | 'date' |'comments' |null>('date');
  return (
    <div
      className={`top-0 right-0 bg-Background/Bottom text-center w-60 h-3/4 pt-4 pl-4 min-h-[600px] rounded-b-3xl mt-8 fixed border-Primary/Dark border-solid box-border border-2 z-30
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
      <button className='w-[140px]' onClick={() => setActiveButton(activeButton==='ascending'?'descending':'ascending')}>
      
      <div className='w-8 inline-block fixed left-6'>
      <img src={activeButton === 'descending' ? Descend : Ascend} alt='Descending/Ascending icon'></img>
      </div>
      <div className='w-28 -ml-6 inline-block sm:max-xl:-ml-6 xl:max-2xl:-ml-8'>
        <p className='text-left text-Primary/Light text-xl'>{activeButton==='descending'?'Descending':'Ascending'}</p>
      </div>
      
      </button>
      </div>
<div className='mb-4'>
<button className='w-[140px]' onClick={() => setMethodButton(methodButton==='date'? null:'date')}>
      
      <div className='w-8 inline-block fixed left-16'>
      <img src={methodButton==='date'? DateClicked:Date} alt='Date icon'></img>
      </div>
      <div className='inline-block -ml-2'>
        <p className={`text-left text-xl ${methodButton==='date'? 'text-Primary/Dark':'text-Primary/Light'}`}>Date</p>
      </div>
      
      </button>
      </div>
      <div className='mb-4'>
<button className='w-[140px]' onClick={() => setMethodButton(methodButton==='likes'? null:'likes')}>
      
      <div className='w-8 inline-block fixed left-16'>
      <img src={methodButton==='likes'? LikesClicked:Likes} alt='Likes icon'></img>
      </div>
      <div className='inline-block ml-0'>
        <p className={`text-left text-xl ${methodButton==='likes'? 'text-Primary/Dark':'text-Primary/Light'}`}>Likes</p>
      </div>
      
      </button>
      </div>
      <div className='mb-4'>
<button className='w-[140px]' onClick={() => setMethodButton(methodButton==='comments'? null:'comments')}>
      
      <div className='w-8 inline-block fixed left-16'>
      <img src={methodButton==='comments'? CommentsClicked:Comments} alt='Comments icon'></img>
      </div>
      <div className='inline-block ml-8'>
        <p className={`text-left text-xl ${methodButton==='comments'? 'text-Primary/Dark':'text-Primary/Light'}`}>Comments</p>
      </div>
      
      </button>
      </div>
      <div className='mb-4'>
      <div className='w-8 inline-block fixed left-6'>
      <img src={Filter} alt='Fliter icon'></img>
      </div>
      <div className='w-32 -ml-6 inline-block sm:max-xl:-ml-6 xl:max-2xl:-ml-8'>
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

