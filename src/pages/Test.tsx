import { FaCircle } from 'react-icons/fa6';
import { IoIosMore } from 'react-icons/io';
import { Link } from 'react-router';

export const Test = () => {
  return (
    <div className='bg-[var(--surface)] text-[var(--text)] border-Primary/Dark relative w-[94vw] sm:w-[94vw] lg:w-[48vw] xl:min-w-[700px] my-2 rounded-3xl px-2 xsm:px-10 py-4 lg:mx-4 flex justify-center'>
      <div className='absolute right-4 lg:right-3 top-2'>
        <button className='hover:text-[var(--text-hovered)] text-3xl'>
          <IoIosMore />
        </button>
      </div>
      <div className='flex xsm:-ml-6 xsm:gap-4 gap-2 items-center justify-between w-full'>
        <div className='flex items-center min-w-[15px] min-h-[15px]'>
          <FaCircle className='text-base text-Accent/Target' />
        </div>
        <div className='flex justify-center'>
          <img
            src='https://via.placeholder.com/64'
            alt='Avatar'
            className='w-16 h-16 rounded-full object-cover flex-shrink-0'
          />
        </div>
        <div className='flex flex-col justify-center flex-grow'>
          <div className='flex'>
            <p className='text-sm xsm:text-base sm:text-lg'>
              <Link to='#' className='text-[var(--text-title)] hover:underline'>
                John Doe
              </Link>{' '}
              sent you an invite to join{' '}
              <Link to='#' className='text-[var(--text-title)] hover:underline'>
                React Developers Group
              </Link>
            </p>
          </div>
          <div className='flex'>
            <p className='text-[var(--green-highlight)] text-sm sm:text-base'>2 hours ago</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <button className='px-4 py-1 bg-Accent/Target rounded-lg w-24'>Accept</button>

          <button className='px-4 py-1 bg-gray-500 text-white rounded-lg w-24'>Reject</button>
        </div>
      </div>
    </div>
  );
};

export default Test;

