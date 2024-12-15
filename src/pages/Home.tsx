import React from 'react';
import NothingPost from '../components/nothingPost';
import ButtonShare from '../components/buttonShare';
import TagList from '../components/tagList';

function Home() {
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      <ButtonShare />
      <NothingPost />
      <TagList />
    </div>
  );
}

export default Home;
