function ButtonShare() {
  return (

    <button className='bg-Background/Bottom text-center mt-0 p-14 w-full h-40 top-0 right-0 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 flex justify-between 
    sm:max-lg:p-14 lg:max-xl:p-10 xl:max-2xl:p-12 md:max-lg:ml-[255px] lg:max-xl:ml-[290px] xl:max-2xl:ml-96 sm:max-md:w-full md:max-lg:w-2/3 lg:max-2xl:w-1/2'>
        <div className="-mt-3 -ml-4 sm:max-xl:-mt-3 xl:max-2xl:-mt-2 sm:max-xl:ml-4 xl:max-2xl:ml-6">
          <img src='profileicon.png' alt='Profile Icon' className="sm:max-2xl:w-20"></img>
        </div>
        <div className='bg-Background/Middle rounded-3xl h-14 w-3/4 py-4 pl-4 -mt-2 sm:max-xl:-mt-2'>
          <p className='text-left text-Primary/Light text-l'>Share your code...</p>
        </div>
    </button>
  
  );
}

export default ButtonShare;
