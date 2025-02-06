import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Ensure to import 'useNavigate' from 'react-router-dom'
import { useAuthUser } from '../context/AuthUserContext';
import Footer from '../components/footer';
import Header from '../components/header';
import { isValidEmail, isStrongPassword } from '../utils/helpers'; // Import validation helper
import { toast } from 'react-toastify';

function Signup() {
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuthUser();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      // If the user is authenticated and the token is valid, redirect to feed
      navigate('/community');
    }
  }, [isAuthenticated, navigate]);
  // State to hold form inputs
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

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

    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      toast.error('Invalid email format. Example: example@gmail.com.');
      return;
    }

    if (!isStrongPassword(formData.password)) {
      toast.error(
        'Password must be at least 8 characters long, include a number and an uppercase letter.',
      );
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      // Send data to the backend
      await signup(formData.username, formData.email, formData.password);

      setTimeout(() => navigate('/feed/me'), 1500); // Redirect to sign-in page after a short delay
    } catch (error: any) {
      // Handle errors
      toast.error(error.response?.data?.message || 'An error occurred during signup.');
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
          <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
            <form onSubmit={handleSubmit}>
              <h3 className='text-3xl text-white m-6 pt-10'>SIGN UP</h3>
              <input
                type='text'
                placeholder='Username'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='username'
                value={formData.username}
                onChange={handleChange}
                maxLength={30}
              />
              <br />
              <input
                type='text'
                placeholder='Email'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='email'
                value={formData.email}
                onChange={handleChange}
              />
              <br />
              <input
                type='password'
                placeholder='Password'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='password'
                value={formData.password}
                onChange={handleChange}
                autoComplete='new-password'
              />
              <br />
              <input
                type='password'
                placeholder='Password Confirm'
                className='bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3'
                name='passwordConfirm'
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
              <br />
              <p className='text-l text-white m-6 mx-2'>
                Already have an account?{' '}
                <Link to='/signin' className='font-bold'>
                  Sign in!
                </Link>
              </p>
              <button className='transition-colors duration-300 ease-in-out w-32 h-10 rounded-xl bg-Accent/Target text-xl text-white m-6 hover:bg-white hover:text-Accent/Target'>
                Sign up
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Signup;

