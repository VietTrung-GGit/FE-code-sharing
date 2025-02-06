import Search from '../assets/search.svg';
import UserBrief from '../components/userBrief';
import { useState } from 'react';
function AddMember() {
  const [showAddedMember, setShowAddedMember] = useState(false);
  return (
    <div
      className='bg-Background/Bottom bg-center bg-cover border-2 h-[700px]  border-Primary/Dark px-6 py-4 w-[450px] flex flex-col items-center rounded-3xl sm:max-lg:rounded-3xl  lg:mt-4 lg:rounded-3xl
        border-solid box-border text-center relative'
    >
      <div className='flex flex-row w-full items-center space-x-4 mx-4'>
        <div className='inline-block flex-shrink-0 w-9 h-9 items-center justify-center flex'>
          <img src={Search} alt='Search Icon' className='w-9 h-9 rounded-full object-cover' />
        </div>

        {/* Share Text Section */}
        <input
          className='bg-Background/Middle inline-block flex-grow py-4 px-4 rounded-3xl h-10 w-5/6 text-left text-Primary/Light text-l'
          placeholder='Search for users...'
        ></input>
      </div>
      <div className='flex flex-row w-full items-center space-x-4 mt-8 gap-[275px]'>
        <div className='inline-block flex-shrink-0'>
          <div className=''>
            <img
              src={
                'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
              }
              alt='Profile Icon'
              className='w-16 h-16 rounded-full object-cover ml-3'
            />
          </div>
          <button className='absolute top-[130px] left-[75px]'>
            <svg
              width='23'
              height='23'
              viewBox='0 0 23 23'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M22.5 11.5C22.5 17.5751 17.5751 22.5 11.5 22.5C5.42487 22.5 0.5 17.5751 0.5 11.5C0.5 5.42487 5.42487 0.5 11.5 0.5C17.5751 0.5 22.5 5.42487 22.5 11.5Z'
                fill='#00F587'
              />
              <path
                d='M15.25 7.75L7.75 15.25M15.25 15.25L7.75 7.75'
                stroke='white'
                stroke-width='2'
                stroke-linecap='round'
              />
            </svg>
          </button>
        </div>
        <button>
          <svg
            width='21'
            height='23'
            viewBox='0 0 21 23'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M15.1362 15.1487C15.8129 14.7849 16.5875 14.5779 17.4124 14.5779H17.4152C17.4991 14.5779 17.5382 14.4771 17.4767 14.4212C16.6189 13.6508 15.6389 13.0286 14.577 12.58C14.5658 12.5745 14.5546 12.5717 14.5434 12.5661C16.2799 11.3041 17.4096 9.25316 17.4096 6.93917C17.4096 3.10584 14.3113 0 10.4888 0C6.66636 0 3.5709 3.10584 3.5709 6.93917C3.5709 9.25316 4.70059 11.3041 6.43986 12.5661C6.42868 12.5717 6.41749 12.5745 6.40631 12.58C5.15638 13.1089 4.03508 13.8672 3.07037 14.8353C2.11123 15.7933 1.34763 16.929 0.822171 18.179C0.305179 19.403 0.0261632 20.7144 6.99233e-05 22.0431C-0.000676413 22.0729 0.00455827 22.1026 0.0154657 22.1304C0.0263731 22.1583 0.0427324 22.1836 0.0635798 22.205C0.0844271 22.2264 0.109341 22.2433 0.136852 22.2549C0.164364 22.2665 0.193917 22.2725 0.223771 22.2725H1.89873C2.01897 22.2725 2.11964 22.1746 2.12243 22.0543C2.17836 19.8942 3.0424 17.8712 4.57196 16.3378C6.15185 14.7513 8.25464 13.8783 10.4916 13.8783C12.0771 13.8783 13.5983 14.3176 14.9097 15.1403C14.9434 15.1614 14.9821 15.1734 15.0219 15.1749C15.0616 15.1763 15.1011 15.1673 15.1362 15.1487ZM10.4916 11.7518C9.21096 11.7518 8.00577 11.251 7.09698 10.3416C6.64985 9.89534 6.29537 9.36496 6.05398 8.78102C5.81258 8.19707 5.68904 7.5711 5.69046 6.93917C5.69046 5.65487 6.19099 4.44611 7.09698 3.53674C8.00297 2.62737 9.20816 2.12652 10.4916 2.12652C11.7751 2.12652 12.9775 2.62737 13.8863 3.53674C14.3334 3.983 14.6879 4.51338 14.9293 5.09733C15.1707 5.68127 15.2943 6.30724 15.2928 6.93917C15.2928 8.22348 14.7923 9.43224 13.8863 10.3416C12.9775 11.251 11.7723 11.7518 10.4916 11.7518ZM20.7763 18.4112H18.4274V16.0608C18.4274 15.9377 18.3268 15.837 18.2037 15.837H16.6378C16.5148 15.837 16.4141 15.9377 16.4141 16.0608V18.4112H14.0653C13.9422 18.4112 13.8416 18.5119 13.8416 18.635V20.2019C13.8416 20.3251 13.9422 20.4258 14.0653 20.4258H16.4141V22.7762C16.4141 22.8993 16.5148 23 16.6378 23H18.2037C18.3268 23 18.4274 22.8993 18.4274 22.7762V20.4258H20.7763C20.8993 20.4258 21 20.3251 21 20.2019V18.635C21 18.5119 20.8993 18.4112 20.7763 18.4112Z'
              fill='#00F587'
            />
          </svg>
        </button>
      </div>
      <div className='mt-6 space-y-6'>
        <p className='text-xl text-white text-left font-semibold'>Suggested:</p>
        <div className='flex'>
          <div className='flex flex-row w-full items-center gap-28'>
            <div className='flex gap-10'>
              <div className='inline-block flex-shrink-0'>
                <img
                  src={
                    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
                  }
                  alt='Profile Icon'
                  className='w-16 h-16 rounded-full object-cover'
                />
              </div>
              <div className='flex flex-col flex-grow'>
                <p className='text-white font-semibold text-2xl'>displayname</p>
                <p className='text-Primary/Light text-left'>@username</p>
              </div>
            </div>
            <button onClick={() => setShowAddedMember((prev) => !prev)}>
              {showAddedMember ? (
                <svg
                  width='22'
                  height='22'
                  viewBox='0 0 23 23'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M22.5107 11.5C22.5107 17.5751 17.5858 22.5 11.5107 22.5C5.43555 22.5 0.510686 17.5751 0.510686 11.5C0.510686 5.42487 5.43555 0.5 11.5107 0.5C17.5858 0.5 22.5107 5.42487 22.5107 11.5Z'
                    fill='white'
                  />
                  <circle cx='11.5' cy='12' r='7.5' fill='#00F587' />
                </svg>
              ) : (
                <svg
                  width='22'
                  height='22'
                  viewBox='0 0 22 22'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <circle cx='11' cy='11' r='11' fill='white' />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AddMember;

