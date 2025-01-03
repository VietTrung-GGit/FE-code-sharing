import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router';
import LayoutSignin from '../components/layoutSignin';
import Footer from '../components/footer';
import Header from '../components/header';

function Signin() {

  const [usermail, setUsermail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // To redirect after successful sign-in

  
  const realApiCall = async ({ usermail, password }: { usermail: string; password: string }) => {
    try {
      const response = await fetch('https://6ccc7abf-6654-41f7-a219-0f9ec42fddc6.mock.pstmn.io', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usermail, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }
  
      return await response.json();
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error messages

    // Simulated API call to backend
    try {
      const response = await realApiCall({ usermail, password }); // Replace with actual API call
      if (response.success) {
        navigate('/home'); // Redirect to a protected page on success
      } else {
        setErrorMessage(response.message); // Display error from backend
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {/* Header */}
      <Header />

      {/* Body */}
      <main className='flex-grow relative'>
        {/* Negative Margin to Overlap with Header */}
        <div className='px-5 md:px-10 pt-0 mt-[-4rem] flex justify-center'>
        <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
      <h3 className='text-3xl text-white m-6 pt-10'>SIGN IN</h3>
      <form onSubmit={handleSubmit}>
      <input
        type='text'
        placeholder='Username/Email'
        value={usermail}
        onChange={(e) => setUsermail(e.target.value)}
        className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3 '
        required
      ></input>
      <br></br>
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
        required
      ></input>
      <br></br>
      {errorMessage && (
                <p className='text-red-500 text-l m-6'>{errorMessage}</p>
              )}
      <p className='text-l text-white m-6'>
        Don't have an account?{' '}
        <Link to='/signup' className='font-bold'>
          Sign up!
        </Link>
      </p>
      <button type='submit' className='w-32 h-10 rounded-xl bg-white text-xl text-Primary/Dark m-6 hover:bg-Primary/Dark hover:text-white'>
        Sign in
      </button>
      </form>
    </div>
        </div>
      </main>

      {/*Footer */}
      <Footer />
    </div>
  );
}

export default Signin;
