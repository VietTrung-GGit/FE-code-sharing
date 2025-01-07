import React from 'react';
import PostBrief from '../components/postBrief';
import PostCreate from '../components/postCreate';
import PostDetail from '../components/postDetail';

function Test() {

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {/*Footer */}
      <PostBrief  postID={1}/>
      <PostDetail  />
      <PostCreate  />
    </div>
  );
}

export default Test;
