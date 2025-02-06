import { AiFillPlusCircle } from 'react-icons/ai';

function ProjectCreate() {
  return (
    <div
      className='bg-Background/Bottom bg-center bg-cover border-2 h-[400px]  border-Primary/Dark px-14 py-10 w-[700px] flex flex-col rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border relative'
    >
      <p className=' text-white font-semibold text-left text-2xl'>New project</p>

      <div className='inline-block flex-shrink-0 flex-row flex mt-8 space-x-8'>
        <img
          src={
            'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          }
          alt='Profile Icon'
          className='w-40 h-40 rounded-3xl object-cover'
        />
        <div className='flex flex-col -mt-2 '>
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Title'
              className='w-full mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
            />
            <input
              type='text'
              placeholder='Description'
              className='w-full h-28 mt-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 '
            />
          </div>
        </div>
      </div>

      <button className='transition-colors duration-300 ease-in-out w-28 h-8 rounded-xl bg-Accent/Target text-lg text-white mb-4 hover:bg-white hover:text-Accent/Target absolute bottom-10 right-14 flex flex-row gap-2 px-6 items-center'>
        <p>New</p>
        <AiFillPlusCircle className=' text-2xl mt-1' />
      </button>
    </div>
  );
}
export default ProjectCreate;

