import { Link } from 'react-router-dom';

function NothingPost({ state }: { state: string | undefined }) {
  return (
    <div
      className={`${state === 'stored' ? 'lg:mt-8' : 'lg:mt-16'} flex bg-Background/Bottom text-center mx-6 mt-20 p-14 w-full h-40 border-Primary/Dark border-solid box-border border-2 rounded-3xl mb-28
    sm:max-lg:p-14 lg:max-xl:p-10 xl:p-12 lg:w-1/2 sm:max-lg:mt-20 sm:max-lg:mx-10`}
    >
      <div className='mt-1 sm:max-lg:mt-3 lg:max-xl:mt-5 xl:mt-4'>
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

