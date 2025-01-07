import React from 'react';
import { Link } from 'react-router';
import Footer from '../components/footer';
import Header from '../components/header';

function Landing() {
  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {/* Header */}
      <Header />

      {/* Body */}
      <main className='flex-grow relative'>
        {/* Negative Margin to Overlap with Header */}
        <div className='px-5 md:px-10 pt-0 mt-[-4rem] flex justify-center'>
        <div className="min-h-4/5 bg-Background/Bottom bg-[url('backgroundeffect.png')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-2 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl">
      <div className="mt-20 lg:mt-0 grid md:grid-cols-2 place-items-center p-0 bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover">
        <div className='flex flex-col text-white md:pb-20'>
          <div className='font-mono flex items-center justify-center py-2 text-8xl lg:text-9xl'>
            Co
            <span className='text-Accent/Light'>Dash</span>
          </div>
          <p className='text-xl justify-center '>/*your personal shorcut to</p>
          <div className='flex items-center justify-center text-xl'>
            <span className='text-Primary/Light'>sharing code</span>
            <span>*/</span>
          </div>
          <div className='flex items-center justify-center '>
            <Link to='/signin'>
              <button className='w-24 h-8 rounded-xl bg-white text-xl text-Primary/Dark m-3 hover:bg-Primary/Dark hover:text-white'>
                Sign in
              </button>
            </Link>
            <Link to='/signup'>
              <button className='w-24 h-8 rounded-xl bg-Accent/Target text-xl text-white m-3 hover:bg-white hover:text-Accent/Target'>
                Sign up
              </button>
            </Link>
          </div>
        </div>
        <img src='preview.png' alt='App Preview' className='w-3/5 md:w-4/5 h-auto flex' />
      </div>
    </div>
        </div>
        <div className="h-[410px] bg-Background/Bottom my-20 bg-[url('assets/particle.svg')] bg-no-repeat bg-center px-5 md:px-10 grid grid-cols-2">
        <img
          src='f1.jpeg'
          alt='Illustration1'
          className='w-full h-full object-cover overflow-hidden border-l-2 border-Primary/Dark'
        />
        <div className='flex flex-col text-white justify-self-start self-center space-y-1 pl-10 text-xl md:text-2xl'>
          <p>
            {' '}
            Join in a community for <span className='text-Primary/Light'>coders</span> to{' '}
            <span className='text-Accent/Target'>share</span>, explore and get involved in{' '}
            <span className='text-Primary/Light'>your favorite topics</span>.
          </p>
        </div>
      </div>

      <div className="h-[410px] bg-Background/Bottom my-20 bg-[url('assets/particle.svg')] bg-no-repeat bg-center px-5 md:px-10 grid grid-cols-2">
        <div className='flex flex-col text-white justify-self-end self-center space-y-1 pr-10 text-xl md:text-2xl'>
          <p className='text-right'>
            Surfing <span className='text-Accent/Target'>social media</span> is now ideally
            integrated with <span className='text-Primary/Light'>code learning</span> and{' '}
            <span className='text-Primary/Light'>sharing</span>.
          </p>
        </div>
        <img
          src='f2.jpg'
          alt='Illustration2'
          className='w-full h-full object-cover overflow-hidden border-r-2 border-Primary/Dark'
        />
      </div>
      </main>

      {/*Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
