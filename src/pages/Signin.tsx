import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthUser } from '../context/AuthUserContext';
import Footer from '../components/footer';
import Header from '../components/header';
import LoadingSpinner from '../components/loadingAnimate';
import { TbEye, TbEyeOff } from 'react-icons/tb';

function Signin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthUser();
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="h-[620px] bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
            <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center'>
              <h3 className='text-3xl text-white m-6 pt-10'>SIGN IN</h3>

              {/* Username */}
              <input
                type='text'
                placeholder='Username/ Email'
                className='bg-inputbox-Sign rounded-3xl p-3 w-11/12 text-l mb-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='username'
                value={formData.username}
                onChange={handleChange}
              />

              {/* Password */}
              <div className='relative w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3 my-6'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  className='bg-inputbox-Sign rounded-3xl p-3 w-full text-l pr-12'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  className='absolute inset-y-0 right-3 flex items-center'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <TbEye className='w-5 h-5 text-gray-500' />
                  ) : (
                    <TbEyeOff className='w-5 h-5 text-gray-500' />
                  )}
                </button>
              </div>

              {/* Don't have an account? */}
              <p className='text-l text-white my-4'>
                Don't have an account?{' '}
                <Link to='/signup' className='font-bold text-Accent/Light'>
                  Sign up!
                </Link>
              </p>

              {/* Forgot Password */}
              <p className='text-l text-gray-600 my-4'>
                <Link to='/pass-reset' className='font-bold'>
                  Forgot your password?
                </Link>
              </p>

              {/* Submit Button / Loading State */}
              {loading ? (
                <LoadingSpinner />
              ) : (
                <button className='transition-colors duration-300 ease-in-out w-32 h-10 rounded-xl bg-white text-xl text-Primary/Dark hover:bg-Primary/Dark hover:text-white'>
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

