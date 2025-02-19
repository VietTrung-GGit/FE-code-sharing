import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import Footer from '../components/footer';
import Header from '../components/header';
import LoadingSpinner from '../components/loadingAnimate';

function Signin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthUser();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      // If the user is authenticated and the token is valid, redirect to feed
      navigate('/community');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // State to display feedback messages
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Handler to manage input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // **Client-Side Validation**
    if (!formData.username.trim()) {
      toast.error('Username is required.');
      return;
    }

    if (!formData.password.trim()) {
      toast.error('Password is required.');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Send data to the backend
      await login(formData.username, formData.password);
    } catch (error: any) {
      // Handle errors
      toast.error(error.response?.data?.message || 'An error occurred during sign-in.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className='bg-Background/Middle relative min-h-screen flex flex-col'>
      {/* Header */}
      <Header />

      {/* Body */}
      <main className='flex-grow relative'>
        {/* Negative Margin to Overlap with Header */}
        <div className='px-3 lg:px-10 pt-0 mt-[-4rem] flex justify-center'>
          <div className="h-[680px] bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
            <form onSubmit={handleSubmit}>
              <h3 className='text-3xl text-white m-6 pt-10'>SIGN IN</h3>
              <input
                type='text'
                placeholder='Username'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3 transition-all duration-300 ease-in-out focus:outline-none focus:ring-3 focus:ring-primary focus:ring-offset-2'
                name='username'
                value={formData.username}
                onChange={handleChange}
              />
              <br />
              <input
                type='password'
                placeholder='Password'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3 transition-all duration-300 ease-in-out focus:outline-none focus:ring-3 focus:ring-primary focus:ring-offset-2'
                name='password'
                value={formData.password}
                onChange={handleChange}
                autoComplete='current-password'
              />
              <br />
              <p className='text-l text-white m-6 mx-2'>
                Don't have an account?{' '}
                <Link to='/signup' className='font-bold text-Accent/Light'>
                  Sign up!
                </Link>
              </p>

              <p className='text-l text-gray-600 m-6 mx-2'>
                <Link to='/pass-reset' className='font-bold'>
                  Forget your password?
                </Link>
              </p>
              {loading ? (
                <LoadingSpinner /> // Show loading spinner when submitting
              ) : (
                <button className='transition-colors duration-300 ease-in-out w-32 h-10 rounded-xl bg-white text-xl text-Primary/Dark m-6 hover:bg-Primary/Dark hover:text-white'>
                  Sign in
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Signin;

