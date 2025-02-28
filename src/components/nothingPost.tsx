import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function NothingPost() {
  const { theme } = useTheme();

  return (
    <div className='mb-5'>
      <div className='flex justify-center mx-6 sm:max-lg:mx-14 lg:mx-8'>
        <div
          className={`${
            theme === 'original'
              ? 'bg-Background/Bottom text-white border-2'
              : 'bg-[var(--surface)] text-[var(--text)]'
          } h-32  border-Primary/Dark px-6 py-4 w-[88vw] sm:w-[94vw] lg:w-1/2 xl:min-w-[725px] flex items-center justify-between rounded-3xl
        border-solid box-border text-center mt-3`}
        >
          <div className='h-auto'>
            <p className='text-left text-l mt-0'>
              Nothing here... Go explore{' '}
              <Link to='/community/posts' className='text-Accent/Target cursor-pointer inline'>
                Codemunity&nbsp;
              </Link>
              for more interesting content!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NothingPost;

