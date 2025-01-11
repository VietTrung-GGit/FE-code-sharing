import { Link } from 'react-router-dom';

function NothingPost() {
  return (
    <div
      className='bg-Background/Bottom text-center mt-24 p-14 w-full h-40 relative border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-28
    sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:mx-[160px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2 sm:max-lg:mt-24 lg:max-2xl:-mt-16'
    >
      <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-5 xl:max-2xl:mt-4'>
        <p className='text-left text-white text-l'>
          Nothing here... Go explore{' '}
          <Link to='/feed' className='text-Accent/Target cursor-pointer inline'>
            Codemunity
          </Link>{' '}
          or{' '}
          <Link to='/feed/me' className='text-Primary/Light cursor-pointer inline'>
            share your own code
          </Link>{' '}
          !
        </p>
      </div>
    </div>
  );
}

export default NothingPost;

